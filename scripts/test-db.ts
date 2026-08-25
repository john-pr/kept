import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const [userCount, itemTypeCount, collectionCount, itemCount, tagCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.itemType.count(),
      prisma.collection.count(),
      prisma.item.count(),
      prisma.tag.count(),
    ]);

  console.log("Database connection successful.");
  console.log({
    users: userCount,
    itemTypes: itemTypeCount,
    collections: collectionCount,
    items: itemCount,
    tags: tagCount,
  });

  const demoUser = await prisma.user.findUnique({
    where: { email: "demo@kept.app" },
    select: {
      id: true,
      email: true,
      name: true,
      isPro: true,
      emailVerified: true,
      password: true,
      collections: {
        select: {
          id: true,
          name: true,
          items: {
            select: {
              item: {
                select: {
                  id: true,
                  title: true,
                  itemType: { select: { name: true } },
                  tags: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!demoUser) {
    throw new Error("Demo user (demo@kept.app) not found — run `npm run db:seed`.");
  }

  console.log("\nDemo user:");
  console.log({
    id: demoUser.id,
    email: demoUser.email,
    name: demoUser.name,
    isPro: demoUser.isPro,
    emailVerified: demoUser.emailVerified,
    hasPassword: Boolean(demoUser.password),
  });

  console.log("\nDemo collections:");
  for (const collection of demoUser.collections) {
    console.log(`- ${collection.name} (${collection.items.length} items)`);
    for (const { item } of collection.items) {
      const tags = item.tags.map((tag) => tag.name).join(", ");
      console.log(`    [${item.itemType.name}] ${item.title}${tags ? ` (${tags})` : ""}`);
    }
  }
}

main()
  .catch((error) => {
    console.error("Database connection failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
