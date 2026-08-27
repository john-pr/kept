import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { toSearchPreview } from "@/lib/search-preview";
import { DASHBOARD_RECENT_ITEMS_LIMIT } from "@/lib/constants";
import { isProOnlyType } from "@/lib/plan-limits";

export interface ItemTypeSummary {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  itemCount: number;
  isPro: boolean;
}

export async function getItemTypes(userId: string): Promise<ItemTypeSummary[]> {
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: { _count: { select: { items: { where: { userId } } } } },
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
        isPro: isProOnlyType(lowerName),
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
  typeName: string;
  typeIcon: string;
  typeColor: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
}

function toItemSummary(item: {
  id: string;
  title: string;
  content: string | null;
  url: string | null;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  itemType: { name: string; icon: string; color: string };
  tags: { name: string }[];
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
}): ItemSummary {
  return {
    id: item.id,
    title: item.title,
    content: item.content ?? item.url ?? item.description ?? "",
    tags: item.tags.map((tag) => tag.name),
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    typeName: item.itemType.name,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    createdAt: item.createdAt,
  };
}

export async function getPinnedItems(
  userId: string,
  limit = DASHBOARD_RECENT_ITEMS_LIMIT
): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { itemType: true, tags: true },
  });

  return items.map(toItemSummary);
}

export async function getRecentItems(
  userId: string,
  limit = DASHBOARD_RECENT_ITEMS_LIMIT
): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    take: limit,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: { itemType: true, tags: true },
  });

  return items.map(toItemSummary);
}

export interface PaginatedItems {
  items: ItemSummary[];
  totalCount: number;
}

async function getPaginatedItemsByWhere(
  where: Prisma.ItemWhereInput,
  skip: number,
  take: number
): Promise<PaginatedItems> {
  const [items, totalCount] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: { itemType: true, tags: true },
      skip,
      take,
    }),
    prisma.item.count({ where }),
  ]);

  return { items: items.map(toItemSummary), totalCount };
}

export async function getItemsByType(
  itemTypeId: string,
  userId: string,
  skip: number,
  take: number
): Promise<PaginatedItems> {
  return getPaginatedItemsByWhere({ itemTypeId, userId }, skip, take);
}

export async function getItemsByCollection(
  collectionId: string,
  userId: string,
  skip: number,
  take: number
): Promise<PaginatedItems> {
  return getPaginatedItemsByWhere({ userId, collections: { some: { collectionId } } }, skip, take);
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  itemType: { name: string; icon: string; color: string };
  collections: { id: string; name: string }[];
}

const itemDetailInclude = {
  itemType: true,
  tags: true,
  collections: { include: { collection: true } },
} as const;

function toItemDetail(item: {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: { name: string }[];
  itemType: { name: string; icon: string; color: string };
  collections: { collection: { id: string; name: string } }[];
}): ItemDetail {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    language: item.language,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    tags: item.tags.map((tag) => tag.name),
    itemType: {
      name: item.itemType.name,
      icon: item.itemType.icon,
      color: item.itemType.color,
    },
    collections: item.collections.map(({ collection }) => ({
      id: collection.id,
      name: collection.name,
    })),
  };
}

export async function getItemOwnerId(id: string): Promise<string | null> {
  const item = await prisma.item.findUnique({ where: { id }, select: { userId: true } });
  return item?.userId ?? null;
}

export interface UpdateItemInput {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<ItemDetail> {
  const item = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        set: [],
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      collections: {
        deleteMany: {},
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: itemDetailInclude,
  });

  return toItemDetail(item);
}

export async function getItemTypeById(id: string): Promise<{ id: string; name: string } | null> {
  const itemType = await prisma.itemType.findUnique({ where: { id }, select: { id: true, name: true } });
  return itemType;
}

export interface CreateItemInput {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  tags: string[];
  itemTypeId: string;
  userId: string;
  collectionIds: string[];
}

export async function createItem(data: CreateItemInput): Promise<ItemDetail> {
  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType: data.fileUrl ? "FILE" : "TEXT",
      itemTypeId: data.itemTypeId,
      userId: data.userId,
      tags: {
        connectOrCreate: data.tags.map((name) => ({
          where: { name },
          create: { name },
        })),
      },
      collections: {
        create: data.collectionIds.map((collectionId) => ({ collectionId })),
      },
    },
    include: itemDetailInclude,
  });

  return toItemDetail(item);
}

export async function deleteItem(id: string): Promise<void> {
  await prisma.item.delete({ where: { id } });
}

export async function getItemCountForUser(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId } });
}

export async function setItemFavorite(id: string, isFavorite: boolean): Promise<void> {
  await prisma.item.update({ where: { id }, data: { isFavorite } });
}

export async function setItemPin(id: string, isPinned: boolean): Promise<void> {
  await prisma.item.update({ where: { id }, data: { isPinned } });
}

export interface ItemDeletionInfo {
  userId: string;
  fileUrl: string | null;
}

export async function getItemForDeletion(id: string): Promise<ItemDeletionInfo | null> {
  const item = await prisma.item.findUnique({
    where: { id },
    select: { userId: true, fileUrl: true },
  });
  return item;
}

export interface ItemSearchEntry {
  id: string;
  title: string;
  contentPreview: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
}

export async function getAllItemsForSearch(userId: string): Promise<ItemSearchEntry[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      url: true,
      description: true,
      itemType: { select: { name: true, icon: true, color: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    contentPreview: toSearchPreview(item.content ?? item.url ?? item.description ?? ""),
    typeName: item.itemType.name,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
  }));
}

export interface FavoriteItem {
  id: string;
  title: string;
  typeName: string;
  typeIcon: string;
  typeColor: string;
  updatedAt: Date;
}

export async function getFavoriteItems(userId: string): Promise<FavoriteItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      itemType: { select: { name: true, icon: true, color: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    typeName: item.itemType.name,
    typeIcon: item.itemType.icon,
    typeColor: item.itemType.color,
    updatedAt: item.updatedAt,
  }));
}

export async function getItemById(id: string, userId: string): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    include: itemDetailInclude,
  });

  if (!item) return null;

  return toItemDetail(item);
}