import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  totalItems: number;
  totalCollections: number;
  favoriteItems: number;
  favoriteCollections: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [totalItems, totalCollections, favoriteItems, favoriteCollections] = await Promise.all([
    prisma.item.count(),
    prisma.collection.count(),
    prisma.item.count({ where: { isFavorite: true } }),
    prisma.collection.count({ where: { isFavorite: true } }),
  ]);

  return { totalItems, totalCollections, favoriteItems, favoriteCollections };
}

export interface ItemTypeCount {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemTypeBreakdown: ItemTypeCount[];
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: { _count: { select: { items: { where: { userId } } } } },
    }),
  ]);

  const itemTypeBreakdown = itemTypes
    .map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    }))
    .sort((a, b) => b.count - a.count);

  return { totalItems, totalCollections, itemTypeBreakdown };
}