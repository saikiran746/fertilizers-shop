const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    phone: { type: String, default: "+91-98765-43210" },
    whatsappNumber: { type: String, default: "919876543210" }, // digits only, with country code
    email: { type: String, default: "info@AgroPlus.in" },
    address: { type: String, default: "123 Agriculture Road, Hyderabad, Telangana 500001" },
    businessHours: { type: String, default: "Mon–Sat: 9:00 AM – 6:00 PM" },
    // Email sender config (for admin to send replies to clients)
    senderEmail: { type: String, default: "" },
    senderEmailPassword: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
