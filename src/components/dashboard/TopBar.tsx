import Link from "next/link";
import { Search, FolderPlus, Plus, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "@/components/dashboard/MobileSidebar";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";

interface TopBarProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
}

export function TopBar({ itemTypes, favoriteCollections, recentCollections }: TopBarProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-border px-4 py-3 md:grid md:grid-cols-3 md:items-center md:gap-4">
      <div className="flex items-center justify-between gap-2 md:justify-start">
        <div className="flex items-center gap-2">
          <div className="md:hidden">
            <MobileSidebar
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
            />
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            <Code className="size-5 text-primary" />
            <span>DevStash</span>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="outline" size="icon-sm" aria-label="New Collection">
            <FolderPlus />
          </Button>
          <Button size="icon-sm" aria-label="New Item">
            <Plus />
          </Button>
        </div>
      </div>

      <div className="relative w-full md:mx-auto md:max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search items, collections, tags..." className="pl-9" />
      </div>

      <div className="hidden items-center justify-end gap-2 md:flex">
        <Button variant="outline">
          <FolderPlus />
          New Collection
        </Button>
        <Button>
          <Plus />
          New Item
        </Button>
      </div>
    </header>
  );
}