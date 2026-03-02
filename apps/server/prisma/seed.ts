import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const adminHash = await bcrypt.hash("Admin123456!", 10);
  const userHash = await bcrypt.hash("User123456!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nestdrive.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nestdrive.com",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@nestdrive.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@nestdrive.com",
      passwordHash: userHash,
      role: "USER",
      emailVerified: new Date(),
    },
  });

  console.log(`Seeded admin: ${admin.email}`);
  console.log(`Seeded user:  ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
