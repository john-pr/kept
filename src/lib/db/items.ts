import { prisma } from "@/lib/prisma";

export interface ItemSummary {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  typeIcon: string;
  typeColor: string;
}

function toItemSummary(item: {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemType: { icon: string; color: string };
  tags: { name: string }[];
}): ItemSummary {
  return {
    id: item.id,
    title: item.title,
    content: item.content ?? item.url ?? item.description ?? "",
    tags: item.tags.map((tag) => tag.name),
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
  };
}

export async function getPinnedItems(): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toItemSummary);
}

export async function getRecentItems(limit = 10): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toItemSummary);
}