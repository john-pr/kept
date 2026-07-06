import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  user,
  itemTypes,
  collections,
  items,
} from "../src/lib/mock-data";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      isPro: user.isPro,
    },
  });

  for (const itemType of itemTypes) {
    await prisma.itemType.upsert({
      where: { id: itemType.id },
      update: {},
      create: {
        id: itemType.id,
        name: itemType.name,
        icon: itemType.icon,
        color: itemType.color,
        isSystem: true,
      },
    });
  }

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { id: collection.id },
      update: {},
      create: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite,
        userId: dbUser.id,
      },
    });
  }

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        title: item.title,
        contentType: "TEXT",
        content: item.content,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        createdAt: new Date(item.createdAt),
        userId: dbUser.id,
        itemTypeId: item.itemTypeId,
        tags: {
          connectOrCreate: item.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
        collections: {
          create: item.collectionIds.map((collectionId) => ({
            collection: { connect: { id: collectionId } },
          })),
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
