import Link from "next/link";
import { Star } from "lucide-react";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";
import { iconMap } from "@/lib/icon-map";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarNavProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
  collapsed?: boolean;
}

export function SidebarNav({
  itemTypes,
  favoriteCollections,
  recentCollections,
  collapsed = false,
}: SidebarNavProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        {!collapsed && (
          <h3 className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
            Item Types
          </h3>
        )}
        <nav className="flex flex-col gap-0.5">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon];
            return (
              <Link
                key={type.id}
                href={`/items/${type.slug}`}
                title={collapsed ? type.name : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <span className="relative shrink-0">
                  <Icon className="size-4" style={{ color: type.color }} />
                  {collapsed && type.isPro && (
                    <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-muted-foreground" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate">{type.name}</span>
                    {type.isPro && (
                      <Badge
                        variant="outline"
                        className="text-[10px] tracking-wide text-muted-foreground"
                      >
                        PRO
                      </Badge>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {type.itemCount}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {favoriteCollections.length > 0 && (
        <div>
          {!collapsed && (
            <h3 className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
              Favorite Collections
            </h3>
          )}
          <nav className="flex flex-col gap-0.5">
            {favoriteCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                title={collapsed ? collection.name : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted",
                  collapsed && "justify-center"
                )}
              >
                <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
                {!collapsed && <span className="truncate">{collection.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div>
        {!collapsed && (
          <h3 className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
            Recent Collections
          </h3>
        )}
        <nav className="flex flex-col gap-0.5">
          {recentCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              title={collapsed ? collection.name : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted",
                collapsed && "justify-center"
              )}
            >
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ backgroundColor: collection.borderColor }}
              />
              {!collapsed && <span className="truncate">{collection.name}</span>}
            </Link>
          ))}
          <Link
            href="/collections"
            title={collapsed ? "View all collections" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center"
            )}
          >
            {!collapsed && <span className="truncate">View all collections</span>}
            {collapsed && <span className="truncate">…</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
}