import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial administrator login account...");

  // Securely hash the initial admin password (salt rounds = 12)
  // Can be configured via environment variables or default to secure initial credential
  const adminEmail = process.env.ADMIN_EMAIL || "admin@brightstars.edu.pk";
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "Admin@BSS2026";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Seed ONLY the single administrator user record
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      name: "Administrator",
      email: adminEmail,
      passwordHash,
    },
  });

  console.log("=================================================");
  console.log("Admin account successfully provisioned:");
  console.log(`Email / Username : ${adminUser.email}`);
  console.log("Password         : (Securely hashed with bcrypt)");
  console.log("=================================================");
  console.log("NOTE: All student, teacher, fee, exam, and attendance tables remain completely empty.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
