const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const publicRoutes = require("./routes/public");
const chatbotRoutes = require("./routes/chatbot");

const prisma = require("./prismaClient");

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", publicRoutes);
app.use("/api/chatbot", chatbotRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "ok", message: "Fertilizers Shop API (PostgreSQL)" }));

// ── Prisma Test Connection ──────────────────────────────────────────────────
prisma.$connect()
  .then(() => console.log("✅ PostgreSQL connected via Prisma"))
  .catch((err) => console.error("❌ PostgreSQL error:", err));

// ── Start server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
