const ChatSession = require('../models/ChatSession');
const ChatbotSettings = require('../models/ChatbotSettings');

// Helper: get or create singleton settings
async function getOrCreateSettings() {
  let settings = await ChatbotSettings.findOne();
  if (!settings) {
    settings = await ChatbotSettings.create({});
  }
  return settings;
}

// GET /api/admin/chatbot/settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching admin chatbot settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// PUT /api/admin/chatbot/settings
exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    // Validate quick actions if provided
    if (updateData.quickActions && !Array.isArray(updateData.quickActions)) {
      return res.status(400).json({ error: 'quickActions must be an array' });
    }

    const settings = await ChatbotSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// GET /api/admin/chatbot/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's sessions
    const todaySessionsCount = await ChatSession.countDocuments({
      createdAt: { $gte: today }
    });

    // Get average messages per session
    const avgMessagesResult = await ChatSession.aggregate([
      { $group: { _id: null, avgMsg: { $avg: '$totalMessages' } } }
    ]);
    const avgMessages = avgMessagesResult[0]?.avgMsg ? Math.round(avgMessagesResult[0].avgMsg) : 0;

    // Get user satisfaction
    const satisfactionResult = await ChatSession.aggregate([
      { $match: { 'userFeedback.rating': { $ne: null } } },
      { $group: { 
          _id: null, 
          avgRating: { $avg: '$userFeedback.rating' },
          count: { $sum: 1 }
      }}
    ]);
    const satisfaction = {
      average: satisfactionResult[0]?.avgRating ? Number(satisfactionResult[0].avgRating.toFixed(1)) : 0,
      totalFeedback: satisfactionResult[0]?.count || 0
    };

    // Get top quick actions
    const quickActionsResult = await ChatSession.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.metadata.quickAction': { $ne: null } } },
      { $group: { _id: '$messages.metadata.quickAction', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get daily conversations for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyConversations = await ChatSession.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { 
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalConversations: settings.totalConversations,
      totalMessages: settings.totalMessages,
      todayConversations: todaySessionsCount,
      averageMessages: avgMessages,
      satisfaction,
      topQuickActions: quickActionsResult.map(r => ({ label: r._id, count: r.count })),
      dailyConversations
    });

  } catch (error) {
    console.error('Error fetching chatbot analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// GET /api/admin/chatbot/conversations
exports.getConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    const total = await ChatSession.countDocuments(query);
    const conversations = await ChatSession.find(query)
      .select('sessionId totalMessages lastActivity userFeedback createdAt messages')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map to include a preview of the first message
    const formattedConversations = conversations.map(conv => {
      const firstUserMsg = conv.messages.find(m => m.role === 'user');
      return {
        _id: conv._id,
        sessionId: conv.sessionId,
        totalMessages: conv.totalMessages,
        lastActivity: conv.lastActivity,
        createdAt: conv.createdAt,
        userFeedback: conv.userFeedback,
        preview: firstUserMsg ? firstUserMsg.content : 'No user messages'
      };
    });

    res.json({
      conversations: formattedConversations,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// GET /api/admin/chatbot/conversations/:id
exports.getConversation = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// DELETE /api/admin/chatbot/conversations/:id
exports.deleteConversation = async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// DELETE /api/admin/chatbot/conversations
exports.clearConversations = async (req, res) => {
  try {
    await ChatSession.deleteMany({});
    
    // Reset counters in settings
    await ChatbotSettings.findOneAndUpdate({}, { 
      $set: { totalConversations: 0, totalMessages: 0 } 
    });

    res.json({ message: 'All conversations cleared successfully' });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
};
