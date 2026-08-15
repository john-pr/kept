import { prisma } from "@/lib/prisma";

export interface CollectionTypeIcon {
  id: string;
  icon: string;
  color: string;
}

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  borderColor: string;
  types: CollectionTypeIcon[];
}

type CollectionWithItems = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  items: { item: { itemType: { id: string; icon: string; color: string } } }[];
};

function toCollectionSummary(collection: CollectionWithItems): CollectionSummary {
  const typeCounts = new Map<string, { count: number; icon: string; color: string }>();

  for (const { item } of collection.items) {
    const existing = typeCounts.get(item.itemType.id);
    if (existing) {
      existing.count += 1;
    } else {
      typeCounts.set(item.itemType.id, {
        count: 1,
        icon: item.itemType.icon,
        color: item.itemType.color,
      });
    }
  }

  const sortedTypes = Array.from(typeCounts.entries()).sort((a, b) => b[1].count - a[1].count);
  const dominantColor = sortedTypes[0]?.[1].color;

  return {
    id: collection.id,
    name: collection.name,
    description: collection.description,
    isFavorite: collection.isFavorite,
    itemCount: collection.items.length,
    borderColor: dominantColor ?? "var(--border)",
    types: sortedTypes.map(([id, { icon, color }]) => ({ id, icon, color })),
  };
}

const collectionWithItemsInclude = {
  items: {
    include: {
      item: {
        include: { itemType: true },
      },
    },
  },
} as const;

export async function getRecentCollections(userId: string, limit = 6): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: collectionWithItemsInclude,
  });

  return collections.map(toCollectionSummary);
}

export async function getFavoriteCollections(userId: string): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { createdAt: "desc" },
    include: collectionWithItemsInclude,
  });

  return collections.map(toCollectionSummary);
}

export interface CollectionOption {
  id: string;
  name: string;
}

export async function getCollectionOptions(userId: string): Promise<CollectionOption[]> {
  return prisma.collection.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export interface CreateCollectionData {
  name: string;
  description: string | null;
  userId: string;
}

export async function createCollection(data: CreateCollectionData): Promise<CollectionSummary> {
  const collection = await prisma.collection.create({
    data: {
      name: data.name,
      description: data.description,
      userId: data.userId,
    },
    include: collectionWithItemsInclude,
  });

  return toCollectionSummary(collection);
}