const prisma = require('../prismaClient');
const { buildKnowledgeContext } = require('../services/knowledgeBase');
const { generateChatResponse } = require('../services/openaiService');

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

exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, history } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    const settings = await getOrCreateSettings();
    if (!settings.enabled) {
      return res.status(503).json({ error: 'Chatbot is currently offline. Please contact us via phone or WhatsApp.' });
    }

    let session = await prisma.chatSession.findUnique({ 
      where: { sessionId },
      include: { messages: true }
    });
    const isNewSession = !session;

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId,
          ipAddress: req.ip || req.connection?.remoteAddress,
          userAgent: req.get('User-Agent') || null
        },
        include: { messages: true }
      });
    }

    const matchingAction = settings.quickActions.find(qa => qa.prompt === message);
    
    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: 'user',
        content: message,
        quickAction: matchingAction ? matchingAction.label : null
      }
    });

    const refreshedSession = await prisma.chatSession.findUnique({
      where: { id: session.id },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });

    const messageHistory = refreshedSession.messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    const knowledgeContext = await buildKnowledgeContext();
    const { reply, metadata } = await generateChatResponse(messageHistory, settings, knowledgeContext);

    const productConnections = metadata?.productsReferenced?.map(id => ({
      product: { connect: { id } }
    })) || [];

    await prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: 'assistant',
        content: reply,
        products: {
          create: productConnections
        }
      }
    });

    const finalMessagesCount = await prisma.chatMessage.count({
      where: { chatSessionId: session.id, role: { not: 'system' } }
    });

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        totalMessages: finalMessagesCount,
        lastActivity: new Date()
      }
    });

    if (isNewSession) {
      await prisma.chatbotSettings.updateMany({ data: { totalConversations: { increment: 1 }, totalMessages: { increment: 2 } } });
    } else {
      await prisma.chatbotSettings.updateMany({ data: { totalMessages: { increment: 2 } } });
    }

    res.json({ reply, metadata: metadata || {}, sessionId });
  } catch (error) {
    console.error('Error sending chatbot message:', error);
    res.status(500).json({ error: 'Failed to process message. Please try again.' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await prisma.chatSession.findUnique({ where: { sessionId } });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.chatSession.update({
      where: { id: session.id },
      data: {
        rating: rating || null,
        comment: comment || null
      }
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await prisma.chatSession.findUnique({ 
      where: { sessionId },
      include: {
        messages: {
          where: { role: { not: 'system' } },
          orderBy: { timestamp: 'asc' },
          include: { products: true }
        }
      }
    });

    if (!session) {
      return res.json({ messages: [] });
    }

    const messages = session.messages.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      metadata: {
        quickAction: m.quickAction,
        feedbackRating: m.feedbackRating,
        productsReferenced: m.products.map(p => p.productId)
      }
    }));

    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};
