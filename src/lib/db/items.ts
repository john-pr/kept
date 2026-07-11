import { prisma } from "@/lib/prisma";

export interface ItemTypeSummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  itemCount: number;
  isPro: boolean;
}

const PRO_TYPE_NAMES = new Set(["file", "image"]);

export async function getItemTypes(): Promise<ItemTypeSummary[]> {
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: { _count: { select: { items: true } } },
  });

  return itemTypes
    .map((type) => {
      const lowerName = type.name.toLowerCase();
      const pluralLowerName = `${lowerName}s`;
      return {
        id: type.id,
        name: pluralLowerName.charAt(0).toUpperCase() + pluralLowerName.slice(1),
        slug: pluralLowerName,
        icon: type.icon,
        color: type.color,
        itemCount: type._count.items,
        isPro: PRO_TYPE_NAMES.has(lowerName),
      };
    })
    .sort((a, b) => b.itemCount - a.itemCount);
}

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

export async function getPinnedItems(limit = 10): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    take: limit,
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