const dotenv = require('dotenv');
const prisma = require('../prismaClient');

// Load env vars
dotenv.config();

const DEFAULT_QUICK_ACTIONS = [
  { emoji: '🌾', label: 'Best Fertilizer For Rice', prompt: 'What is the best fertilizer for rice cultivation? Please recommend products available on your website.' },
  { emoji: '🌱', label: 'Cotton Crop Guide', prompt: 'Give me a complete fertilizer guide for cotton crop cultivation with your product recommendations.' },
  { emoji: '🍅', label: 'Tomato Fertilizer Plan', prompt: 'What fertilizer plan do you recommend for tomato farming? Include stage-wise application.' },
  { emoji: '📈', label: 'Increase Crop Yield', prompt: 'How can I increase my crop yield? What fertilizers and practices do you recommend?' },
  { emoji: '🧪', label: 'Soil Health Tips', prompt: 'Give me tips to improve soil health and fertility. What products should I use?' },
  { emoji: '⛅', label: 'Weather Farming Advice', prompt: 'How should I adjust my fertilizer application based on different weather conditions?' },
  { emoji: '💰', label: 'Fertilizer Cost Calculator', prompt: 'I want to calculate fertilizer requirements for my farm. Please help me with the calculation.' },
  { emoji: '📞', label: 'Contact Expert', prompt: 'I want to speak with a fertilizer expert. How can I contact your team?' }
];

const seedChatbotSettings = async () => {
  try {
    console.log('PostgreSQL Connected via Prisma');

    console.log('Checking for existing chatbot settings...');
    
    let settings = await prisma.chatbotSettings.findFirst();
    
    if (settings) {
      console.log('Chatbot settings already exist in the database.');
    } else {
      console.log('Creating default chatbot settings...');
      await prisma.chatbotSettings.create({
        data: {
          quickActions: {
            create: DEFAULT_QUICK_ACTIONS
          }
        }
      });
      console.log('Default chatbot settings created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding chatbot settings:', error);
    process.exit(1);
  }
};

seedChatbotSettings();
