const mongoose = require('mongoose');

const quickActionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  label: { type: String, required: true },
  prompt: { type: String, required: true }
}, { _id: true });

const chatbotSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  welcomeMessage: {
    type: String,
    default: '\ud83d\udc4b Welcome to AgroPlus AI!\nAsk me about fertilizers, crops, soil health, farming practices, product recommendations, and crop nutrition.'
  },
  quickActions: {
    type: [quickActionSchema],
    default: [
      { emoji: '\ud83c\udf3e', label: 'Best Fertilizer For Rice', prompt: 'What is the best fertilizer for rice cultivation? Please recommend products available on your website.' },
      { emoji: '\ud83c\udf31', label: 'Cotton Crop Guide', prompt: 'Give me a complete fertilizer guide for cotton crop cultivation with your product recommendations.' },
      { emoji: '\ud83c\udf45', label: 'Tomato Fertilizer Plan', prompt: 'What fertilizer plan do you recommend for tomato farming? Include stage-wise application.' },
      { emoji: '\ud83d\udcc8', label: 'Increase Crop Yield', prompt: 'How can I increase my crop yield? What fertilizers and practices do you recommend?' },
      { emoji: '\ud83e\uddea', label: 'Soil Health Tips', prompt: 'Give me tips to improve soil health and fertility. What products should I use?' },
      { emoji: '\ud83c\udf26', label: 'Weather Farming Advice', prompt: 'How should I adjust my fertilizer application based on different weather conditions?' },
      { emoji: '\ud83d\udcb0', label: 'Fertilizer Cost Calculator', prompt: 'I want to calculate fertilizer requirements for my farm. Please help me with the calculation.' },
      { emoji: '\ud83d\udcde', label: 'Contact Expert', prompt: 'I want to speak with a fertilizer expert. How can I contact your team?' }
    ]
  },
  systemPrompt: {
    type: String,
    default: ''
  },
  modelName: { type: String, default: 'gpt-4o-mini' },
  maxTokens: { type: Number, default: 500 },
  temperature: { type: Number, default: 0.7 },
  totalConversations: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ChatbotSettings', chatbotSettingsSchema);
