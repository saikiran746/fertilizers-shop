const readline = require("readline");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const prisma = require("../prismaClient");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function seed() {
  console.log("Connected to PostgreSQL via Prisma");

  const existing = await prisma.admin.count();
  if (existing > 0) {
    const ans = await ask(`Admin already exists. Overwrite? (yes/no): `);
    if (ans.toLowerCase() !== "yes") {
      console.log("Aborted.");
      process.exit(0);
    }
    await prisma.admin.deleteMany({});
  }

  const username = await ask("Enter admin username: ");
  const password = await ask("Enter admin password (min 6 chars): ");

  if (!username || password.length < 6) {
    console.error("Invalid username or password too short.");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({ 
    data: { username: username.trim(), password: hashedPassword } 
  });
  console.log(`✅ Admin created: ${admin.username}`);
  rl.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
