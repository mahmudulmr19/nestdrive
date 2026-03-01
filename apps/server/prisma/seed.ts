import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const passwordHash = await bcrypt.hash("Admin123456!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nestdrive.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nestdrive.com",
      passwordHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
