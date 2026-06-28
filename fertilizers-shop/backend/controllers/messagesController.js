const prisma = require("../prismaClient");
const nodemailer = require("nodemailer");
const mapMongoId = require("../utils/mongoMapper");

// POST /api/contact  (public — client submits message)
exports.submitMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const msg = await prisma.message.create({ 
      data: { name, email, phone, message } 
    });
    res.status(201).json({ success: true, id: msg.id, _id: msg.id });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/admin/messages  (admin — list all, newest first)
exports.getMessages = async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(mapMongoId(messages));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/admin/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.message.count({ where: { isRead: false } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/admin/messages/:id/read
exports.markRead = async (req, res) => {
  try {
    const msg = await prisma.message.update({ 
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json(mapMongoId(msg));
  } catch (err) {
    // If not found, Prisma throws an error (P2025). Catch it manually or send 404
    if (err.code === 'P2025') {
      return res.status(404).json({ error: "Message not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// PATCH /api/admin/messages/mark-all-read
exports.markAllRead = async (req, res) => {
  try {
    await prisma.message.updateMany({ 
      where: { isRead: false },
      data: { isRead: true } 
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/admin/messages/:id
exports.deleteMessage = async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/admin/messages  (delete ALL)
exports.deleteAllMessages = async (req, res) => {
  try {
    await prisma.message.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/admin/messages/:id/send-email  (send email reply to client)
exports.sendEmailReply = async (req, res) => {
  try {
    const { subject, body } = req.body;
    const msg = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!msg) return res.status(404).json({ error: "Message not found" });

    const settings = await prisma.siteSettings.findFirst();
    if (!settings?.senderEmail || !settings?.senderEmailPassword) {
      return res.status(400).json({
        error: "Email not configured. Please set Gmail address and App Password in Admin Settings.",
      });
    }

    // Strip ALL spaces, tabs, dashes from the app password before use
    const cleanPass = settings.senderEmailPassword.replace(/[\s\-]/g, "");
    const cleanEmail = settings.senderEmail.trim().toLowerCase();

    console.log(`📧 Sending email via ${cleanEmail} (pass length: ${cleanPass.length})`);

    // Use explicit SMTP config — more reliable than service:"gmail"
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // use STARTTLS
      auth: {
        user: cleanEmail,
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false, // avoid cert issues on local dev
      },
    });

    // Verify connection before sending
    await transporter.verify();

    await transporter.sendMail({
      from: `"AgroPlus Fertilizers" <${cleanEmail}>`,
      to: msg.email,
      subject: subject || `Re: Your enquiry at AgroPlus`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:white;margin:0;font-size:22px">AgroPlus Fertilizers</h2>
            <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px">Premium Crop Nutrition Solutions</p>
          </div>
          <div style="background:#f9fafb;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
            <p style="color:#374151;font-size:15px;margin:0 0 16px">Dear <strong>${msg.name}</strong>,</p>
            <div style="background:white;border-left:4px solid #16a34a;padding:16px 20px;border-radius:0 8px 8px 0;white-space:pre-wrap;color:#374151;font-size:14px;line-height:1.6">${body}</div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
            <p style="color:#6b7280;font-size:12px;margin:0">
              <strong>AgroPlus Fertilizers</strong><br/>
              ${settings.phone || ""} | ${settings.email || ""}<br/>
              ${settings.address || ""}
            </p>
          </div>
        </div>
      `,
    });

    // Mark as read when replied
    await prisma.message.update({ 
      where: { id: req.params.id }, 
      data: { isRead: true } 
    });

    res.json({ success: true, message: `Email sent to ${msg.email}` });
  } catch (err) {
    console.error("Email send error:", err.message);

    // Friendly error messages
    let errMsg = err.message || "Failed to send email";
    if (err.message?.includes("BadCredentials") || err.message?.includes("535") || err.message?.includes("Username and Password")) {
      errMsg = "Gmail credentials invalid. Make sure: (1) 2-Step Verification is ON in your Google account, (2) You generated a Gmail App Password at myaccount.google.com/apppasswords, (3) You entered the App Password (not your regular Gmail password).";
    } else if (err.message?.includes("ECONNREFUSED") || err.message?.includes("ETIMEDOUT")) {
      errMsg = "Cannot connect to Gmail. Check your internet connection.";
    } else if (err.message?.includes("Invalid login")) {
      errMsg = "Login failed. Use Gmail App Password (enable 2FA first at myaccount.google.com), NOT your regular Gmail password.";
    }

    res.status(500).json({ error: errMsg });
  }
};
