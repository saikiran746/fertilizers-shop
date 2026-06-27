const mongoose = require("mongoose");
require("dotenv").config();
const Admin = require("../models/Admin");

async function seedDefault() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/fertilizers_shop");
  console.log("Connected to MongoDB");

  const existing = await Admin.countDocuments();
  if (existing > 0) {
    console.log("Admin already exists. Skipping seed.");
    process.exit(0);
  }

  await Admin.create({ username: "admin", password: "admin123" });
  console.log("✅ Default admin created — username: admin, password: admin123");
  process.exit(0);
}

seedDefault().catch((err) => {
  console.error(err);
  process.exit(1);
});
