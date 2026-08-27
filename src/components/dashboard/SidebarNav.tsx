"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";
import { iconMap } from "@/lib/icon-map";
import { withAlpha } from "@/lib/color";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSoftTintAlpha } from "@/hooks/useSoftTintAlpha";

interface SidebarNavProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
  collapsed?: boolean;
  userIsPro?: boolean;
  /** Taller rows (~44px vs. ~32px) for touch use — opt-in so desktop's mouse-driven
   * `Sidebar` stays pixel-identical; only `MobileSidebar`'s drawer passes this. */
  comfortable?: boolean;
}

// Matches the dotted-divider section-label convention already established on
// `ItemDrawerView.tsx` ("Content"/"Tags"/"Collections" headers) — see
// context/design-system.md's "Typography conventions".
export const SECTION_LABEL_CLASS =
  "border-b border-dotted border-border pb-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase";

export function SidebarNav({
  itemTypes,
  favoriteCollections,
  recentCollections,
  collapsed = false,
  userIsPro = false,
  comfortable = false,
}: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("appChrome");
  const rowPadding = comfortable ? "py-3" : "py-1.5";
  const alphaSuffix = useSoftTintAlpha();

  return (
    <div className="flex flex-col gap-6">
      <div>
        {!collapsed && <h3 className={cn("mb-2 px-2", SECTION_LABEL_CLASS)}>{t("itemTypes")}</h3>}
        <nav className="flex flex-col gap-0.5">
          {itemTypes.map((type) => {
            const Icon = iconMap[type.icon];
            const showProBadge = type.isPro && !userIsPro;
            const isActive = pathname === `/items/${type.slug}`;
            const isEmpty = type.itemCount === 0;
            return (
              <Link
                key={type.id}
                href={`/items/${type.slug}`}
                title={collapsed ? type.name : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 text-[11px] text-foreground hover:bg-muted",
                  rowPadding,
                  collapsed && "justify-center",
                  isActive && "bg-muted font-medium",
                  // Zero-count types read as dimmed via a real muted color rather than
                  // `opacity`, which drove the count text below the 4.5:1 contrast floor
                  // (a11y pass). The icon chip keeps the softer look via opacity — it's
                  // decorative, so contrast rules don't apply.
                  isEmpty && !isActive && "text-muted-foreground [&_[data-type-chip]]:opacity-60"
                )}
              >
                <span
                  data-type-chip
                  className="relative flex size-6 shrink-0 items-center justify-center"
                  style={{ backgroundColor: withAlpha(type.color, alphaSuffix) }}
                >
                  {Icon && <Icon className="size-3.5" style={{ color: type.color }} />}
                  {collapsed && showProBadge && (
                    <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-muted-foreground" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="truncate tracking-[0.12em] uppercase">{type.name}</span>
                    {showProBadge && (
                      <Badge
                        variant="outline"
                        className="text-[10px] tracking-wide text-muted-foreground"
                      >
                        {t("pro")}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "ml-auto text-[11px] tabular-nums",
                        // `text-muted-foreground` clears 4.5:1 on the page bg but not on the
                        // active row's `bg-muted` — brighten it just there (a11y pass).
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {String(type.itemCount).padStart(2, "0")}
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
            <h3 className={cn("mb-2 px-2", SECTION_LABEL_CLASS)}>{t("favoriteCollections")}</h3>
          )}
          <nav className="flex flex-col gap-0.5">
            {favoriteCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                title={collapsed ? collection.name : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 text-[11px] text-foreground hover:bg-muted",
                  rowPadding,
                  collapsed && "justify-center",
                  pathname === `/collections/${collection.id}` && "bg-muted font-medium"
                )}
              >
                <span className="size-2 shrink-0 bg-primary" />
                {!collapsed && <span className="truncate">{collection.name}</span>}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div>
        {!collapsed && (
          <h3 className={cn("mb-2 px-2", SECTION_LABEL_CLASS)}>{t("recentCollections")}</h3>
        )}
        <nav className="flex flex-col gap-0.5">
          {recentCollections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              title={collapsed ? collection.name : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 text-[11px] text-foreground hover:bg-muted",
                rowPadding,
                collapsed && "justify-center",
                pathname === `/collections/${collection.id}` && "bg-muted font-medium"
              )}
            >
              <span
                className="size-2 shrink-0"
                style={{ backgroundColor: collection.borderColor }}
              />
              {!collapsed && <span className="truncate">{collection.name}</span>}
            </Link>
          ))}
          <Link
            href="/collections"
            title={collapsed ? t("viewAllCollections") : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground",
              rowPadding,
              collapsed && "justify-center",
              pathname === "/collections" && "bg-muted font-medium text-foreground"
            )}
          >
            {!collapsed && <span className="truncate">{t("viewAllCollections")}</span>}
            {collapsed && <span className="truncate">…</span>}
          </Link>
        </nav>
      </div>
    </div>
  );
}
