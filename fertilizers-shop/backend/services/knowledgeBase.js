const prisma = require('../prismaClient');

let cachedContext = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function buildKnowledgeContext() {
  const now = Date.now();
  if (cachedContext && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedContext;
  }

  try {
    // Fetch all visible products
    const products = await prisma.product.findMany({
      where: { visible: true },
      select: { name: true, description: true, category: true }
    });

    // Fetch site settings
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = {
        phone: '+91-98765-43210',
        whatsappNumber: '919876543210',
        email: 'info@AgroPlus.in',
        address: '123 Agriculture Road, Hyderabad, Telangana 500001',
        businessHours: 'Mon–Sat: 9:00 AM – 6:00 PM'
      };
    }

    // Get distinct categories
    const categoriesSet = new Set(products.map(p => p.category));
    const categories = Array.from(categoriesSet);

    // Group products by category
    const productsByCategory = {};
    categories.forEach(cat => { productsByCategory[cat] = []; });
    products.forEach(p => {
      if (productsByCategory[p.category]) {
        productsByCategory[p.category].push(p);
      }
    });

    // Build structured context
    let context = '=== AGROPLUS FERTILIZERS - PRODUCT CATALOG ===\n\n';

    categories.forEach(category => {
      const catProducts = productsByCategory[category];
      if (catProducts.length > 0) {
        context += `\n--- ${category.toUpperCase()} ---\n`;
        catProducts.forEach(p => {
          context += `• ${p.name}: ${p.description}\n`;
        });
      }
    });

    context += '\n\n=== COMPANY INFORMATION ===\n';
    context += `Company: AgroPlus Fertilizers\n`;
    context += `Phone: ${settings.phone}\n`;
    context += `WhatsApp: ${settings.whatsappNumber}\n`;
    context += `Email: ${settings.email}\n`;
    context += `Address: ${settings.address}\n`;
    context += `Business Hours: ${settings.businessHours}\n`;
    context += `Website: This is a product catalog website. Customers can browse products and contact us via phone or WhatsApp to place orders.\n`;

    context += '\n=== PRODUCT CATEGORIES ===\n';
    categories.forEach(cat => {
      context += `• ${cat}\n`;
    });

    context += `\nTotal Products Available: ${products.length}\n`;

    cachedContext = context;
    cacheTimestamp = now;
    return context;
  } catch (error) {
    console.error('Error building knowledge context:', error);
    return 'AgroPlus Fertilizers - Agricultural products catalog. Contact us for more information.';
  }
}

function clearCache() {
  cachedContext = null;
  cacheTimestamp = 0;
}

module.exports = { buildKnowledgeContext, clearCache };
