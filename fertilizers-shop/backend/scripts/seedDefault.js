const bcrypt = require("bcryptjs");
require("dotenv").config();
const prisma = require("../prismaClient");

async function seedDefault() {
  console.log("Connected to PostgreSQL via Prisma");

  const existing = await prisma.admin.count();
  if (existing > 0) {
    console.log("Admin already exists. Skipping seed.");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.admin.create({ 
    data: { username: "admin", password: hashedPassword } 
  });
  console.log("✅ Default admin created — username: admin, password: admin123");
  process.exit(0);
}

seedDefault().catch((err) => {
  console.error(err);
  process.exit(1);
});
