const ChatSession = require('../models/ChatSession');
const ChatbotSettings = require('../models/ChatbotSettings');
const { buildKnowledgeContext } = require('../services/knowledgeBase');
const { generateChatResponse } = require('../services/openaiService');

// Helper: get or create singleton settings
async function getOrCreateSettings() {
  let settings = await ChatbotSettings.findOne();
  if (!settings) {
    settings = await ChatbotSettings.create({});
  }
  return settings;
}

// GET /api/chatbot/settings (public)
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      enabled: settings.enabled,
      welcomeMessage: settings.welcomeMessage,
      quickActions: settings.quickActions
    });
  } catch (error) {
    console.error('Error fetching chatbot settings:', error);
    res.status(500).json({ error: 'Failed to fetch chatbot settings' });
  }
};

// POST /api/chatbot/message (public)
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, history } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    // Check if chatbot is enabled
    const settings = await getOrCreateSettings();
    if (!settings.enabled) {
      return res.status(503).json({ error: 'Chatbot is currently offline. Please contact us via phone or WhatsApp.' });
    }

    // Find or create session
    let session = await ChatSession.findOne({ sessionId });
    const isNewSession = !session;

    if (!session) {
      session = new ChatSession({
        sessionId,
        messages: [],
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get('User-Agent') || null
      });
    }

    // Add user message
    const userMsg = {
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: {}
    };

    // Check if this came from a quick action
    const matchingAction = settings.quickActions.find(qa => qa.prompt === message);
    if (matchingAction) {
      userMsg.metadata.quickAction = matchingAction.label;
    }

    session.messages.push(userMsg);

    // Build message history for AI (last 10 messages)
    const messageHistory = session.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Build knowledge context
    const knowledgeContext = await buildKnowledgeContext();

    // Generate AI response
    const { reply, metadata } = await generateChatResponse(messageHistory, settings, knowledgeContext);

    // Add assistant message
    const assistantMsg = {
      role: 'assistant',
      content: reply,
      timestamp: new Date(),
      metadata: metadata || {}
    };
    session.messages.push(assistantMsg);

    // Update counters
    session.totalMessages = session.messages.filter(m => m.role !== 'system').length;
    session.lastActivity = new Date();

    await session.save();

    // Update global counters
    if (isNewSession) {
      await ChatbotSettings.findOneAndUpdate({}, { $inc: { totalConversations: 1, totalMessages: 2 } });
    } else {
      await ChatbotSettings.findOneAndUpdate({}, { $inc: { totalMessages: 2 } });
    }

    res.json({ reply, metadata, sessionId });
  } catch (error) {
    console.error('Error sending chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message. Please try again.' });
  }
};

// POST /api/chatbot/feedback (public)
exports.submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await ChatSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.userFeedback = {
      rating: rating || null,
      comment: comment || null
    };
    await session.save();

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// GET /api/chatbot/history/:sessionId (public)
exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });

    if (!session) {
      return res.json({ messages: [] });
    }

    const messages = session.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        metadata: m.metadata
      }));

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
