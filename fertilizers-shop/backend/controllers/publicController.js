const prisma = require("../prismaClient");
const mapMongoId = require("../utils/mongoMapper");

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    const query = { visible: true };
    if (category) query.category = category;
    if (search) {
      query.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: query,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.product.count({ where: query }),
    ]);

    res.json({
      products: mapMongoId(products),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / take),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { 
        id: req.params.id, 
        visible: true 
      }
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(mapMongoId(product));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const distinctCategories = await prisma.product.findMany({
      where: { visible: true },
      select: { category: true },
      distinct: ['category'],
    });
    const categories = distinctCategories.map(c => c.category);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
