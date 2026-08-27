"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FolderOpen, FolderPlus, LayoutDashboard, Plus, Rows3, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";
import { cn } from "@/lib/utils";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionOption } from "@/lib/db/collections";

interface MobileTabBarProps {
  itemTypes: ItemTypeSummary[];
  collectionOptions: CollectionOption[];
  isPro: boolean;
}

const TAB_CLASS =
  "flex h-14 cursor-pointer flex-col items-center justify-center gap-1 text-[9px] tracking-[0.10em] uppercase";

/**
 * Sticky bottom tab bar + floating "+" FAB, from the mobile ledger prototype
 * (`kept-mobile-dashboard.html`). Shown below `lg` (mobile + tablet — the desktop
 * sidebar/TopBar layout only kicks in at `lg`), rendered once in the `(app)` layout
 * so it's available from every screen, not just `/dashboard`.
 *
 * "Items" has no single unified route to link to (only per-type `/items/[type]`
 * pages exist) — per explicit decision it opens the same nav drawer as the header's
 * hamburger button (shared open state via `MobileNavContext`), letting the user pick
 * a type from there instead.
 *
 * The "+" FAB is route-aware: on `/collections` it creates a collection; on
 * `/collections/[id]` it creates an item preselected into that collection; on
 * `/items/[type]` it creates an item preselected to that type; everywhere else a
 * plain New Item.
 */
export function MobileTabBar({ itemTypes, collectionOptions, isPro }: MobileTabBarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();
  const t = useTranslations("appChrome");
  const isItemsActive = pathname.startsWith("/items/") || open;

  const isCollectionsList = pathname === "/collections";
  const collectionId = pathname.match(/^\/collections\/([^/]+)/)?.[1];
  const typeSlug = pathname.match(/^\/items\/([^/]+)/)?.[1];
  const typeIdForSlug = typeSlug
    ? itemTypes.find((type) => type.slug === typeSlug)?.id
    : undefined;

  return (
    <>
      <div className="fixed right-4 bottom-[76px] z-40 lg:hidden">
        {isCollectionsList ? (
          <NewCollectionDialog
            trigger={
              <Button
                size="icon-lg"
                className="size-[52px] shadow-lg"
                aria-label={t("newCollection")}
              />
            }
          >
            <FolderPlus className="size-5" />
          </NewCollectionDialog>
        ) : (
          <NewItemDialog
            // Remount when the route's preselection changes — this component is mounted
            // once in the (app) layout and persists across navigations, so useState-based
            // form defaults would otherwise stay frozen at their first-render value.
            key={`${typeIdForSlug ?? ""}:${collectionId ?? ""}`}
            itemTypes={itemTypes}
            collectionOptions={collectionOptions}
            isPro={isPro}
            defaultItemTypeId={typeIdForSlug}
            defaultCollectionIds={collectionId ? [collectionId] : undefined}
            trigger={
              <Button
                size="icon-lg"
                className="size-[52px] shadow-lg"
                aria-label={t("newItem")}
              />
            }
          >
            <Plus className="size-5" />
          </NewItemDialog>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card lg:hidden">
        <Link
          href="/dashboard"
          className={cn(
            TAB_CLASS,
            pathname === "/dashboard"
              ? "bg-accent text-foreground"
              : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="size-[15px]" />
          {t("tabDash")}
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            TAB_CLASS,
            isItemsActive ? "bg-accent text-foreground" : "text-muted-foreground"
          )}
        >
          <Rows3 className="size-[15px]" />
          {t("tabItems")}
        </button>
        <Link
          href="/collections"
          className={cn(
            TAB_CLASS,
            pathname.startsWith("/collections")
              ? "bg-accent text-foreground"
              : "text-muted-foreground"
          )}
        >
          <FolderOpen className="size-[15px]" />
          {t("tabColls")}
        </Link>
        <Link
          href="/profile"
          className={cn(
            TAB_CLASS,
            pathname === "/profile" ? "bg-accent text-foreground" : "text-muted-foreground"
          )}
        >
          <User className="size-[15px]" />
          {t("tabYou")}
        </Link>
      </nav>
    </>
  );
}
