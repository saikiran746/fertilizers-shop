const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided", code: "NO_TOKEN" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.sub).select("-password");
    if (!admin) return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid", code: "TOKEN_INVALID" });
  }
};
