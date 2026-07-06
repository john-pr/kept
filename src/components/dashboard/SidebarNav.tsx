import Link from "next/link";
import { Star } from "lucide-react";
import { itemTypes, collections } from "@/lib/mock-data";
import { iconMap } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  collapsed?: boolean;
}

export function SidebarNav({ collapsed = false }: SidebarNavProps) {
  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.slice(0, 6);

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
                <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                {!collapsed && <span className="truncate">{type.name}</span>}
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
              <span className="size-4 shrink-0 rounded-full bg-muted-foreground/40" />
              {!collapsed && <span className="truncate">{collection.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}