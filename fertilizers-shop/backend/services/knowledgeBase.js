const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');

let cachedContext = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const { CATEGORIES } = require('../models/Product');

async function buildKnowledgeContext() {
  const now = Date.now();
  if (cachedContext && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedContext;
  }

  try {
    // Fetch all visible products
    const products = await Product.find({ visible: true })
      .select('name description category')
      .lean();

    // Fetch site settings
    let settings = await SiteSettings.findOne().lean();
    if (!settings) {
      settings = {
        phone: '+91-98765-43210',
        whatsappNumber: '919876543210',
        email: 'info@AgroPlus.in',
        address: '123 Agriculture Road, Hyderabad, Telangana 500001',
        businessHours: 'Mon\u2013Sat: 9:00 AM \u2013 6:00 PM'
      };
    }

    // Group products by category
    const productsByCategory = {};
    CATEGORIES.forEach(cat => { productsByCategory[cat] = []; });
    products.forEach(p => {
      if (productsByCategory[p.category]) {
        productsByCategory[p.category].push(p);
      }
    });

    // Build structured context
    let context = '=== AGROPLUS FERTILIZERS - PRODUCT CATALOG ===\n\n';

    CATEGORIES.forEach(category => {
      const catProducts = productsByCategory[category];
      if (catProducts.length > 0) {
        context += `\n--- ${category.toUpperCase()} ---\n`;
        catProducts.forEach(p => {
          context += `\u2022 ${p.name}: ${p.description}\n`;
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
    CATEGORIES.forEach(cat => {
      context += `\u2022 ${cat}\n`;
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
