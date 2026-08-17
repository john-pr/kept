"use client";

import { useRouter } from "next/navigation";
import { FolderOpen, Star } from "lucide-react";
import { iconMap } from "@/lib/icon-map";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";
import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

interface FavoritesListProps {
  items: FavoriteItem[];
  collections: FavoriteCollection[];
}

export function FavoritesList({ items, collections }: FavoritesListProps) {
  const router = useRouter();

  if (items.length === 0 && collections.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground">
        <Star className="size-6 opacity-50" />
        No favorites yet. Star an item or collection to see it here.
      </div>
    );
  }

  return (
    <div className="font-mono text-sm">
      {items.length > 0 && (
        <FavoritesSection heading="Items" count={items.length}>
          {items.map((item) => (
            <FavoriteItemRow key={item.id} item={item} />
          ))}
        </FavoritesSection>
      )}
      {collections.length > 0 && (
        <FavoritesSection heading="Collections" count={collections.length}>
          {collections.map((collection) => (
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
  children,
}: {
  heading: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-1.5 px-1 text-xs tracking-wide text-muted-foreground uppercase">
        {heading} ({count})
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

  return (
    <div
      className="flex cursor-pointer items-center gap-3 px-1 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      {Icon && <Icon className="size-3.5 shrink-0" style={{ color: item.typeColor }} />}
      <span className="min-w-0 flex-1 truncate text-foreground">{item.title}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{item.typeName}</span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {new Date(item.updatedAt).toLocaleDateString()}
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
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </span>
      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {new Date(collection.updatedAt).toLocaleDateString()}
      </span>
    </div>
  );
}
