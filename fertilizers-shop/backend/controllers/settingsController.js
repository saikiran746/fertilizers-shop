const SiteSettings = require("../models/SiteSettings");
const nodemailer = require("nodemailer");

// Helper: ensure a single settings doc always exists
async function getOrCreate() {
  let s = await SiteSettings.findOne();
  if (!s) s = await SiteSettings.create({});
  return s;
}

// GET /api/site-settings  (public — never expose email credentials)
exports.getSettings = async (req, res) => {
  try {
    const s = await getOrCreate();
    res.json({
      phone: s.phone,
      whatsappNumber: s.whatsappNumber,
      email: s.email,
      address: s.address,
      businessHours: s.businessHours,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/admin/settings  (admin — full settings, password masked)
exports.getAdminSettings = async (req, res) => {
  try {
    const s = await getOrCreate();
    res.json({
      _id: s._id,
      phone: s.phone,
      whatsappNumber: s.whatsappNumber,
      email: s.email,
      address: s.address,
      businessHours: s.businessHours,
      senderEmail: s.senderEmail,
      // Return password length so UI can show "✓ saved (16 chars)" without exposing it
      senderEmailPasswordLength: s.senderEmailPassword ? s.senderEmailPassword.replace(/[\s-]/g, "").length : 0,
      senderEmailPassword: s.senderEmailPassword ? "••••••••" : "", // masked
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// PUT /api/admin/settings  (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const { phone, whatsappNumber, email, address, businessHours, senderEmail, senderEmailPassword } = req.body;
    const s = await getOrCreate();

    if (phone !== undefined) s.phone = phone;
    if (whatsappNumber !== undefined) s.whatsappNumber = whatsappNumber.replace(/\D/g, ""); // digits only
    if (email !== undefined) s.email = email;
    if (address !== undefined) s.address = address;
    if (businessHours !== undefined) s.businessHours = businessHours;
    if (senderEmail !== undefined) s.senderEmail = senderEmail.trim().toLowerCase();
    // Strip ALL spaces/dashes — Google shows App Passwords as "xxxx xxxx xxxx xxxx"
    if (senderEmailPassword !== undefined && senderEmailPassword !== "••••••••") {
      s.senderEmailPassword = senderEmailPassword.replace(/[\s\-]/g, "");
    }

    await s.save();
    res.json({ success: true, message: "Settings saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/admin/test-email  (admin — test SMTP connection)
exports.testEmailConnection = async (req, res) => {
  try {
    const s = await getOrCreate();
    if (!s?.senderEmail || !s?.senderEmailPassword) {
      return res.status(400).json({ error: "Email credentials not configured yet." });
    }

    const cleanPass = s.senderEmailPassword.replace(/[\s\-]/g, "");
    const cleanEmail = s.senderEmail.trim().toLowerCase();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: cleanEmail, pass: cleanPass },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    res.json({ success: true, message: `✅ Connected successfully as ${cleanEmail}` });
  } catch (err) {
    let errMsg = "Connection failed: " + err.message;
    if (err.message?.includes("535") || err.message?.includes("BadCredentials") || err.message?.includes("Username and Password")) {
      errMsg = "❌ Bad credentials. You must use a Gmail App Password, NOT your regular Gmail password. Enable 2-Step Verification first, then create an App Password at myaccount.google.com/apppasswords";
    }
    res.status(400).json({ error: errMsg });
  }
};

