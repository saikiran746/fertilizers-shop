const prisma = require("../prismaClient");
const mapMongoId = require("../utils/mongoMapper");

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

async function getOrCreateSettings() {
  let settings = await prisma.chatbotSettings.findFirst({
    include: { quickActions: true }
  });
  if (!settings) {
    settings = await prisma.chatbotSettings.create({
      data: {
        quickActions: {
          create: DEFAULT_QUICK_ACTIONS
        }
      },
      include: { quickActions: true }
    });
  }
  return settings;
}

exports.getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching admin chatbot settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updateData = req.body;
    
    if (updateData.quickActions && !Array.isArray(updateData.quickActions)) {
      return res.status(400).json({ error: 'quickActions must be an array' });
    }

    const currentSettings = await getOrCreateSettings();
    
    let dataToUpdate = { ...updateData };
    if (updateData.quickActions) {
      dataToUpdate.quickActions = {
        deleteMany: {},
        create: updateData.quickActions.map(qa => ({ emoji: qa.emoji, label: qa.label, prompt: qa.prompt }))
      };
    } else {
      delete dataToUpdate.quickActions;
    }

    const settings = await prisma.chatbotSettings.update({
      where: { id: currentSettings.id },
      data: dataToUpdate,
      include: { quickActions: true }
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating chatbot settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessionsCount = await prisma.chatSession.count({
      where: { createdAt: { gte: today } }
    });

    const avgMessagesResult = await prisma.chatSession.aggregate({
      _avg: { totalMessages: true }
    });
    const avgMessages = avgMessagesResult._avg.totalMessages ? Math.round(avgMessagesResult._avg.totalMessages) : 0;

    const satisfactionResult = await prisma.chatSession.aggregate({
      where: { rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true }
    });
    const satisfaction = {
      average: satisfactionResult._avg.rating ? Number(satisfactionResult._avg.rating.toFixed(1)) : 0,
      totalFeedback: satisfactionResult._count.rating || 0
    };

    const quickActionsResult = await prisma.chatMessage.groupBy({
      by: ['quickAction'],
      where: { quickAction: { not: null } },
      _count: { quickAction: true },
      orderBy: { _count: { quickAction: 'desc' } },
      take: 5
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = await prisma.chatSession.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });

    const dailyMap = {};
    recentSessions.forEach(session => {
      const dateStr = session.createdAt.toISOString().split('T')[0];
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
    });

    const dailyConversations = Object.keys(dailyMap).sort().map(dateStr => ({
      _id: dateStr,
      count: dailyMap[dateStr]
    }));

    res.json({
      totalConversations: settings.totalConversations,
      totalMessages: settings.totalMessages,
      todayConversations: todaySessionsCount,
      averageMessages: avgMessages,
      satisfaction,
      topQuickActions: quickActionsResult.map(r => ({ label: r.quickAction, count: r._count.quickAction })),
      dailyConversations
    });
  } catch (error) {
    console.error('Error fetching chatbot analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await prisma.chatSession.count();
    const conversations = await prisma.chatSession.findMany({
      orderBy: { lastActivity: 'desc' },
      skip,
      take: limit,
      include: {
        messages: {
          where: { role: 'user' },
          orderBy: { timestamp: 'asc' },
          take: 1
        }
      }
    });

    const formattedConversations = conversations.map(conv => {
      return {
        _id: conv.id,
        sessionId: conv.sessionId,
        totalMessages: conv.totalMessages,
        lastActivity: conv.lastActivity,
        createdAt: conv.createdAt,
        userFeedback: {
          rating: conv.rating,
          comment: conv.comment
        },
        preview: conv.messages.length > 0 ? conv.messages[0].content : 'No user messages'
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

exports.getConversation = async (req, res) => {
  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });
    if (!session) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const formattedSession = {
      ...session,
      _id: session.id,
      userFeedback: {
        rating: session.rating,
        comment: session.comment
      }
    };
    res.json(formattedSession);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const session = await prisma.chatSession.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

exports.clearConversations = async (req, res) => {
  try {
    await prisma.chatSession.deleteMany({});
    
    const currentSettings = await getOrCreateSettings();
    await prisma.chatbotSettings.update({
      where: { id: currentSettings.id },
      data: { totalConversations: 0, totalMessages: 0 }
    });

    res.json({ message: 'All conversations cleared successfully' });
  } catch (error) {
    console.error('Error clearing conversations:', error);
    res.status(500).json({ error: 'Failed to clear conversations' });
  }
};
