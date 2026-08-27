"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FolderOpen, Star } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { formatDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FAVORITES_SORT_OPTIONS,
  sortFavoriteItems,
  sortFavoriteCollections,
  type FavoritesSortOption,
} from "@/lib/favorites-sort";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

interface FavoritesListProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

const SORT_LABEL_KEY: Record<FavoritesSortOption, string> = {
  newest: "sortNewest",
  oldest: "sortOldest",
  "name-asc": "sortNameAsc",
  "name-desc": "sortNameDesc",
  type: "sortType",
};

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const router = useRouter();
  const t = useTranslations("favoritesPage");
  const [sort, setSort] = useState<FavoritesSortOption>("newest");

  const sortedItems = useMemo(() => sortFavoriteItems(items, sort), [items, sort]);
  const sortedCollections = useMemo(
    () => sortFavoriteCollections(collections, sort),
    [collections, sort],
  );

  if (items.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
        <Star className="size-6 opacity-50" />
        {t("empty")}
      </div>
    );
  }

  const sortSelect = (
    <Select value={sort} onValueChange={(value) => setSort(value as FavoritesSortOption)}>
      <SelectTrigger className="w-36" size="sm">
        <SelectValue>
          {(value: FavoritesSortOption) => t(SORT_LABEL_KEY[value])}
        </SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {FAVORITES_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(SORT_LABEL_KEY[option.value])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  const showSortOnItems = sortedItems.length > 0;
  const showSortOnCollections = !showSortOnItems && sortedCollections.length > 0;

  return (
    <div className="font-mono text-sm">
      {sortedItems.length > 0 && (
        <FavoritesSection
          heading={t("items")}
          count={sortedItems.length}
          action={showSortOnItems ? sortSelect : undefined}
        >
          {sortedItems.map((item) => (
            <FavoriteItemRow key={item.id} item={item} />
          ))}
        </FavoritesSection>
      )}
      {sortedCollections.length > 0 && (
        <FavoritesSection
          heading={t("collections")}
          count={sortedCollections.length}
          action={showSortOnCollections ? sortSelect : undefined}
        >
          {sortedCollections.map((collection) => (
            <FavoriteCollectionRow
              key={collection.id}
              collection={collection}
              onSelect={() => router.push(`/collections/${collection.id}`)}
            />
          ))}
        </FavoritesSection>
      )}
    </div>
  );
}

function FavoritesSection({
  heading,
  count,
  action,
  children,
}: {
  heading: string;
  count: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = useTranslations("favoritesPage");
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-1.5 flex items-center justify-between px-1">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">
          {t("sectionHeading", { heading, count })}
        </span>
        {action}
      </div>
      <div className="divide-y divide-border/60 border-t border-b border-border/60">
        {children}
      </div>
    </div>
  );
}

function FavoriteItemRow({ item }: { item: FavoriteItem }) {
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));
  const Icon = iconMap[item.typeIcon];
  const locale = useLocale() as Locale;

  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-1 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      {Icon && <Icon className="size-3.5 shrink-0" style={{ color: item.typeColor }} />}
      <span className="min-w-0 flex-1 truncate text-foreground">{item.title}</span>
      <span
        className="shrink-0 rounded border px-1.5 py-0.5 text-xs font-medium"
        style={{ color: item.typeColor, borderColor: item.typeColor }}
      >
        {item.typeName}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(item.updatedAt, locale)}
      </span>
    </div>
  );
}

function FavoriteCollectionRow({
  collection,
  onSelect,
}: {
  collection: FavoriteCollection;
  onSelect: () => void;
}) {
  const clickableCard = useClickableCard(onSelect);
  const locale = useLocale() as Locale;
  const tc = useTranslations("common");

  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-1 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-foreground">{collection.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {tc("itemCount", { count: collection.itemCount })}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(collection.updatedAt, locale)}
      </span>
    </div>
  );
}
