import Link from "next/link";
import { FolderPlus, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { GlobalSearch } from "@/components/dashboard/GlobalSearch";
import { Logo } from "@/components/homepage/Logo";
import type { ItemSearchEntry, ItemTypeSummary } from "@/lib/db/items";
import type { CollectionOption, CollectionSearchEntry, CollectionSummary } from "@/lib/db/collections";
import type { CurrentUser } from "@/lib/db/users";

interface TopBarProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
  collectionOptions: CollectionOption[];
  searchItems: ItemSearchEntry[];
  searchCollections: CollectionSearchEntry[];
  user: CurrentUser;
}

export function TopBar({
  itemTypes,
  favoriteCollections,
  recentCollections,
  collectionOptions,
  searchItems,
  searchCollections,
  user,
}: TopBarProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border px-4 py-3 md:grid md:grid-cols-3 md:items-center md:gap-4">
      <div className="flex items-center justify-between gap-2 md:justify-start">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileSidebar
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              user={user}
            />
          </div>
          <Logo />
        </div>
        <div className="flex items-center gap-2 md:hidden">
          {!user.isPro && (
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/upgrade" />}
            >
              Upgrade
            </Button>
          )}
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Favorites"
            nativeButton={false}
            render={<Link href="/favorites" />}
          >
            <Star />
          </Button>
          <NewCollectionDialog
            trigger={<Button variant="outline" size="icon-sm" aria-label="New Collection" />}
          >
            <FolderPlus />
          </NewCollectionDialog>
          <NewItemDialog
            itemTypes={itemTypes}
            collectionOptions={collectionOptions}
            isPro={user.isPro}
            trigger={<Button size="icon-sm" aria-label="New Item" />}
          >
            <Plus />
          </NewItemDialog>
        </div>
      </div>

      <div className="w-full md:mx-auto md:max-w-md">
        <GlobalSearch items={searchItems} collections={searchCollections} />
      </div>

      <div className="hidden items-center justify-end gap-2 md:flex">
        {!user.isPro && (
          <Button variant="ghost" nativeButton={false} render={<Link href="/upgrade" />}>
            Upgrade
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Favorites"
          nativeButton={false}
          render={<Link href="/favorites" />}
        >
          <Star />
        </Button>
        <NewCollectionDialog trigger={<Button variant="outline" />}>
          <FolderPlus />
          New Collection
        </NewCollectionDialog>
        <NewItemDialog
          itemTypes={itemTypes}
          collectionOptions={collectionOptions}
          isPro={user.isPro}
          trigger={<Button />}
        >
          <Plus />
          New Item
        </NewItemDialog>
      </div>
    </header>
  );
}