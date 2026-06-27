const router = require("express").Router();
const { getProducts, getProduct, getCategories } = require("../controllers/publicController");
const { getSettings } = require("../controllers/settingsController");
const { submitMessage } = require("../controllers/messagesController");
const { createBooking } = require("../controllers/bookingController");

router.get("/products", getProducts);
router.get("/products/:id", getProduct);
router.get("/categories", getCategories);

// Site settings — public (for footer/contact page)
router.get("/site-settings", getSettings);

// Contact form submission — public
router.post("/contact", submitMessage);

// Bookings — public
router.post("/bookings", createBooking);

module.exports = router;
