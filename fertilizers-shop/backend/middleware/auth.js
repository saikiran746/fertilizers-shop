const jwt = require("jsonwebtoken");
const prisma = require("../prismaClient");

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided", code: "NO_TOKEN" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.sub },
      select: { id: true, username: true, createdAt: true, updatedAt: true } // Excluding password
    });
    if (!admin) return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" });
    
    // Maintain backward compatibility for req.admin._id
    admin._id = admin.id;
    req.admin = admin;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token expired or invalid", code: "TOKEN_INVALID" });
  }
};
