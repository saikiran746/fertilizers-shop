const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");
const bcrypt = require("bcryptjs");
const mapMongoId = require("../utils/mongoMapper");

function signToken(id) {
  return jwt.sign({ sub: id, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "8h",
  });
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }

    const token = signToken(admin.id);
    res.json({ token, expiresIn: process.env.JWT_EXPIRES_IN || "8h", username: admin.username });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMe = async (req, res) => {
  res.json({ id: req.admin.id, _id: req.admin.id, username: req.admin.username });
};
