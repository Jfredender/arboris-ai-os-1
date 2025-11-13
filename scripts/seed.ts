
import bcryptjs from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ARBORIS AI OS 1 database...");

  // Create test admin user
  const adminPassword = await bcryptjs.hash("johndoe123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "john@doe.com" },
    update: {},
    create: {
      email: "john@doe.com",
      password: adminPassword,
      name: "John Doe",
      role: "admin"
    },
  });

  console.log("✅ Created admin user:", admin.email);

  // Create additional admin user as requested
  const arborisAdminPassword = await bcryptjs.hash("ArborisAI2024!", 10);
  
  const arborisAdmin = await prisma.user.upsert({
    where: { email: "admin@arboris.ai" },
    update: {},
    create: {
      email: "admin@arboris.ai",
      password: arborisAdminPassword,
      name: "ARBORIS Admin",
      role: "admin"
    },
  });

  console.log("✅ Created ARBORIS admin user:", arborisAdmin.email);

  // Create VULCANO Chief Architect user
  const vulcanoPassword = await bcryptjs.hash("Vulc@n0Arb0r!s2024#Secure", 10);
  
  const vulcano = await prisma.user.upsert({
    where: { email: "vulcano@arboris.ai" },
    update: {},
    create: {
      email: "vulcano@arboris.ai",
      password: vulcanoPassword,
      name: "VULCANO Chief Architect",
      role: "admin"
    },
  });

  console.log("✅ Created VULCANO Chief Architect:", vulcano.email);

  console.log("🎉 Seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
