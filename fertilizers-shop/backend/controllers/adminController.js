const Product = require("../models/Product");
const Admin = require("../models/Admin");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, visible, price, benefits, inStock, stockQuantity } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({
      name,
      description,
      category,
      image,
      visible: visible === "false" ? false : true,
      price: price ? Number(price) : 0,
      benefits: benefits || "",
      inStock: inStock === "false" ? false : true,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const { name, description, category, visible, price, benefits, inStock, stockQuantity } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (visible !== undefined) product.visible = visible === "false" ? false : true;
    if (price !== undefined) product.price = Number(price);
    if (benefits !== undefined) product.benefits = benefits;
    if (inStock !== undefined) product.inStock = inStock === "false" ? false : true;
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);

    if (req.file) {
      // Delete old image
      if (product.image) {
        const oldPath = path.join(__dirname, "..", product.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Delete image file
    if (product.image) {
      const imgPath = path.join(__dirname, "..", product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.toggleVisibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    product.visible = !product.visible;
    await product.save();
    res.json({ id: product._id, visible: product.visible });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const visible = await Product.countDocuments({ visible: true });
    const hidden = total - visible;
    const categories = await Product.distinct("category");
    res.json({ total, visible, hidden, categories: categories.length });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getEnhancedStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const visible = await Product.countDocuments({ visible: true });
    const hidden = total - visible;
    const categories = await Product.distinct("category");
    
    // Category-wise counts
    const categoryStats = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Recent 10 products for activity timeline
    const recentActivity = await Product.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .select("name category visible createdAt updatedAt image");

    res.json({
      total,
      visible,
      hidden,
      categoriesCount: categories.length,
      categoryStats: categoryStats.map((c) => ({ name: c._id, count: c.count })),
      recentActivity,
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

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
