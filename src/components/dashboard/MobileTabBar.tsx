"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, LayoutDashboard, Plus, Rows3, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
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
  "flex h-14 flex-col items-center justify-center gap-1 text-[9px] tracking-[0.10em] uppercase";

/**
 * Sticky bottom tab bar + floating "+" FAB, from the mobile ledger prototype
 * (`kept-mobile-dashboard.html`). Mobile-only (`md:hidden`), rendered once in the
 * `(app)` layout so it's available from every screen, not just `/dashboard`.
 *
 * "Items" has no single unified route to link to (only per-type `/items/[type]`
 * pages exist) — per explicit decision it opens the same nav drawer as the header's
 * hamburger button (shared open state via `MobileNavContext`), letting the user pick
 * a type from there instead.
 */
export function MobileTabBar({ itemTypes, collectionOptions, isPro }: MobileTabBarProps) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileNav();
  const isItemsActive = pathname.startsWith("/items/") || open;

  return (
    <>
      <div className="fixed right-4 bottom-[76px] z-40 md:hidden">
        <NewItemDialog
          itemTypes={itemTypes}
          collectionOptions={collectionOptions}
          isPro={isPro}
          trigger={
            <Button
              size="icon-lg"
              className="size-[52px] shadow-lg"
              aria-label="New Item"
            />
          }
        >
          <Plus className="size-5" />
        </NewItemDialog>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-card md:hidden">
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
          Dash
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
          Items
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
          Colls
        </Link>
        <Link
          href="/profile"
          className={cn(
            TAB_CLASS,
            pathname === "/profile" ? "bg-accent text-foreground" : "text-muted-foreground"
          )}
        >
          <User className="size-[15px]" />
          You
        </Link>
      </nav>
    </>
  );
}
