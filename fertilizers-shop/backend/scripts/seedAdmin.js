const mongoose = require("mongoose");
const readline = require("readline");
require("dotenv").config();

const Admin = require("../models/Admin");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/fertilizers_shop");
  console.log("Connected to MongoDB");

  const existing = await Admin.countDocuments();
  if (existing > 0) {
    const ans = await ask(`Admin already exists. Overwrite? (yes/no): `);
    if (ans.toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }
    await Admin.deleteMany({});
  }

  const username = await ask("Enter admin username: ");
  const password = await ask("Enter admin password (min 6 chars): ");

  if (!username || password.length < 6) {
    console.error("Invalid username or password too short.");
    process.exit(1);
  }

  const admin = await Admin.create({ username: username.trim(), password });
  console.log(`✅ Admin created: ${admin.username}`);
  rl.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
