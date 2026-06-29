const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const mapMongoId = require("../utils/mongoMapper");

exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(mapMongoId(products));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, visible, price, benefits, inStock, stockQuantity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        image,
        visible: visible === "false" ? false : true,
        price: price ? Number(price) : 0,
        benefits: benefits || "",
        inStock: inStock === "false" ? false : true,
        stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      },
    });
    res.status(201).json(mapMongoId(product));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { name, description, category, visible, price, benefits, inStock, stockQuantity } = req.body;
    
    let updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (visible !== undefined) updateData.visible = visible === "false" ? false : true;
    if (price !== undefined) updateData.price = Number(price);
    if (benefits !== undefined) updateData.benefits = benefits;
    if (inStock !== undefined) updateData.inStock = inStock === "false" ? false : true;
    if (stockQuantity !== undefined) updateData.stockQuantity = Number(stockQuantity);

    if (req.file) {
      // Delete old image
      if (product.image) {
        const oldPath = path.join(__dirname, "..", product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    product = await prisma.product.update({
      where: { id: productId },
      data: updateData
    });
    res.json(mapMongoId(product));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete image file
    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    // Clear references in Booking table to avoid foreign key constraint violations
    await prisma.booking.updateMany({
      where: { productId: req.params.id },
      data: { productId: null }
    });

    // Delete chat message product references
    await prisma.chatMessageProduct.deleteMany({
      where: { productId: req.params.id }
    });

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ error: "Failed to delete product. It may be referenced by existing records." });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: { visible: !product.visible }
    });
    res.json({ id: updatedProduct.id, _id: updatedProduct.id, visible: updatedProduct.visible });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await prisma.product.count();
    const visible = await prisma.product.count({ where: { visible: true } });
    const hidden = total - visible;
    
    const categoriesDistinct = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    res.json({ total, visible, hidden, categories: categoriesDistinct.length });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getUnreadBadges = async (req, res) => {
  try {
    const unreadMessages = await prisma.message.count({ where: { isRead: false } });
    const unreadBookings = await prisma.booking.count({ where: { read: false } });
    res.json({ unreadMessages, unreadBookings });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getEnhancedStats = async (req, res) => {
  try {
    const total = await prisma.product.count();
    const visible = await prisma.product.count({ where: { visible: true } });
    const hidden = total - visible;
    
    const categoriesDistinct = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    
    // Category-wise counts
    const categoryGroup = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        _all: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });

    const categoryStats = categoryGroup.map(g => ({
      name: g.category,
      count: g._count._all
    }));

    // Recent 10 products for activity timeline
    const recentActivity = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, name: true, category: true, visible: true, createdAt: true, updatedAt: true, image: true }
    });

    res.json({
      total,
      visible,
      hidden,
      categoriesCount: categoriesDistinct.length,
      categoryStats,
      recentActivity: mapMongoId(recentActivity),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const adminId = req.admin.id || req.admin._id;
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
