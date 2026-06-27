const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ChatbotSettings = require('../models/ChatbotSettings');

// Load env vars
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fertilizers_shop');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedChatbotSettings = async () => {
  try {
    await connectDB();

    console.log('Checking for existing chatbot settings...');
    
    let settings = await ChatbotSettings.findOne();
    
    if (settings) {
      console.log('Chatbot settings already exist in the database.');
    } else {
      console.log('Creating default chatbot settings...');
      // Creates a document using the defaults defined in the schema
      await ChatbotSettings.create({});
      console.log('Default chatbot settings created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding chatbot settings:', error);
    process.exit(1);
  }
};

seedChatbotSettings();
