const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    productsReferenced: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    quickAction: { type: String, default: null },
    feedbackRating: { type: Number, min: 1, max: 5, default: null }
  }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true },
  messages: [chatMessageSchema],
  totalMessages: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now, index: true },
  userFeedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comment: { type: String, default: null }
  },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null }
}, { timestamps: true });

// Auto-delete sessions after 30 days of inactivity
chatSessionSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
