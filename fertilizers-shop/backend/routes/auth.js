const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const { login, getMe } = require("../controllers/authController");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts. Please try again later." },
});

router.post("/login", loginLimiter, login);
router.get("/me", auth, getMe);

module.exports = router;
