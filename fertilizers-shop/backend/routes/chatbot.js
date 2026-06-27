const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Public chatbot routes
router.get('/settings', chatbotController.getSettings);
router.post('/message', chatbotController.sendMessage);
router.post('/feedback', chatbotController.submitFeedback);
router.get('/history/:sessionId', chatbotController.getHistory);

module.exports = router;
