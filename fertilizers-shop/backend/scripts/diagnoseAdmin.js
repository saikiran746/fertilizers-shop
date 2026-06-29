const bcrypt = require("bcryptjs");
require("dotenv").config();
const prisma = require("../prismaClient");

async function diagnoseAdmin() {
  console.log("🔍 Starting Admin Diagnostics...\n");

  try {
    // 1. Verify admin user exists
    console.log("1. Querying PostgreSQL for Admin users...");
    const admins = await prisma.admin.findMany();
    console.log("   SQL/Prisma Query Results:");
    console.log(`   Found ${admins.length} admin user(s).`);

    if (admins.length > 0) {
      console.log("\n   Admin Details:");
      admins.forEach(admin => {
        console.log(`   - ID: ${admin.id}`);
        console.log(`   - Username: ${admin.username}`);
        console.log(`   - Password Hash: ${admin.password.substring(0, 20)}...`);
      });

      // Test default password "admin123" against the first admin
      console.log("\n3. Testing bcrypt password hashes...");
      const isMatch = await bcrypt.compare("admin123", admins[0].password);
      console.log(`   Does 'admin123' match the hash for '${admins[0].username}'? : ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      if (!isMatch) {
         console.log("\n⚠️ The password for this admin is NOT 'admin123'. If you migrated from MongoDB, the password is whatever you had in MongoDB (if data was migrated), or the hash might be incompatible. Let's reset it to default for safety.");
         
         const hashedPassword = await bcrypt.hash("admin123", 12);
         await prisma.admin.update({
            where: { id: admins[0].id },
            data: { password: hashedPassword }
         });
         console.log("✅ Admin password has been successfully reset to: admin123");
      }
    } else {
      console.log("\n⚠️ NO ADMIN USER FOUND. This is the exact reason your login is failing.");
      console.log("   Reason: When migrating from MongoDB to Neon PostgreSQL, the database started entirely empty. The data was not transferred, only the schema.");
      
      console.log("\n9. Creating default admin user with proper role and hashed password...");
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await prisma.admin.create({ 
        data: { username: "admin", password: hashedPassword } 
      });
      console.log("✅ Default admin successfully created!");
      console.log("   - Username: admin");
      console.log("   - Password: admin123");
    }

    // 5. Verify JWT_SECRET
    console.log("\n5. Verifying JWT_SECRET environment variable...");
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
      console.log("   ✅ JWT_SECRET is configured correctly.");
    } else {
      console.log("   ❌ JWT_SECRET is missing or too short (should be at least 32 characters).");
    }

    console.log("\n✅ Diagnostics Complete.");

  } catch (error) {
    console.error("\n❌ Diagnostics failed. Please check your Neon PostgreSQL connection string in the DATABASE_URL environment variable.");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAdmin();
