const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  getProducts, createProduct, updateProduct, deleteProduct,
  toggleVisibility, getStats, getEnhancedStats, changePassword,
} = require("../controllers/adminController");
const { updateSettings, getAdminSettings, testEmailConnection } = require("../controllers/settingsController");
const {
  getMessages, getUnreadCount, markRead, markAllRead,
  deleteMessage, deleteAllMessages, sendEmailReply,
} = require("../controllers/messagesController");
const { getBookings, getRecentBookings, markBookingRead, updateBookingStatus, deleteBooking } = require("../controllers/bookingController");
const chatbotAdminController = require("../controllers/chatbotAdminController");

router.use(auth);

// Products
router.get("/stats", getStats);
router.get("/enhanced-stats", getEnhancedStats);
router.put("/change-password", changePassword);
router.get("/products", getProducts);
router.post("/products", upload.single("image"), createProduct);
router.put("/products/:id", upload.single("image"), updateProduct);
router.delete("/products/:id", deleteProduct);
router.patch("/products/:id/visibility", toggleVisibility);

// Site Settings
router.get("/settings", getAdminSettings);
router.put("/settings", updateSettings);
router.post("/test-email", testEmailConnection);


// Messages / Notifications
router.get("/messages", getMessages);
router.get("/messages/unread-count", getUnreadCount);
router.patch("/messages/mark-all-read", markAllRead);
router.delete("/messages/all", deleteAllMessages);
router.patch("/messages/:id/read", markRead);
router.post("/messages/:id/send-email", sendEmailReply);
router.delete("/messages/:id", deleteMessage);

// Bookings
router.get("/bookings", getBookings);
router.get("/bookings/recent", getRecentBookings);
router.patch("/bookings/:id/read", markBookingRead);
router.patch("/bookings/:id/status", updateBookingStatus);
router.delete("/bookings/:id", deleteBooking);

// Chatbot management
router.get("/chatbot/settings", chatbotAdminController.getSettings);
router.put("/chatbot/settings", chatbotAdminController.updateSettings);
router.get("/chatbot/analytics", chatbotAdminController.getAnalytics);
router.get("/chatbot/conversations", chatbotAdminController.getConversations);
router.get("/chatbot/conversations/:id", chatbotAdminController.getConversation);
router.delete("/chatbot/conversations/:id", chatbotAdminController.deleteConversation);
router.delete("/chatbot/conversations", chatbotAdminController.clearConversations);

module.exports = router;
