"use client";

import Link from "next/link";
import { FolderPlus, Menu, Sparkles, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserFooter } from "@/components/dashboard/UserFooter";
import { NewCollectionDialog } from "@/components/dashboard/NewCollectionDialog";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";
import type { CurrentUser } from "@/lib/db/users";

interface MobileSidebarProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
  user: CurrentUser;
}

// py-3 (vs. SidebarNav's default py-1.5) targets a ~44px row height for touch use, matching
// the `comfortable` rows passed to `SidebarNav` below.
const QUICK_ACTION_ROW_CLASS =
  "flex h-auto w-full items-center justify-start gap-2 rounded-md px-2 py-3 text-sm font-normal text-foreground hover:bg-muted";

/**
 * Owns the mobile nav drawer (opened from either `TopBar`'s hamburger button or
 * `MobileTabBar`'s "Items" tab, via shared `MobileNavContext` state). Also renders
 * "Quick Actions" (Favorites / New Collection / Upgrade) — relocated here from the
 * old mobile header icon row, which the "ledger" mobile prototype drops in favor of a
 * minimal hamburger + logo + search header. Mobile-only; desktop's `Sidebar` keeps
 * those actions in its own `TopBar` row and doesn't render this component at all.
 */
export function MobileSidebar({
  itemTypes,
  favoriteCollections,
  recentCollections,
  user,
}: MobileSidebarProps) {
  const { open, setOpen } = useMobileNav();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-lg" aria-label="Open sidebar" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-2 py-3">
          <SheetTitle className="text-xs font-medium tracking-wide text-muted-foreground">
            Navigation
          </SheetTitle>
          {/* Custom, larger close button — `SheetContent`'s built-in one is size-7 (28px),
              under the project's touch-target guideline. Overridden at the call site rather
              than in `sheet.tsx`, which is shared by every dialog/sheet in the app. */}
          <SheetClose render={<Button variant="ghost" size="icon-lg" aria-label="Close" />}>
            <X />
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <nav className="mb-6 flex flex-col gap-0.5">
            <h3 className="mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground">
              Quick Actions
            </h3>
            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className={QUICK_ACTION_ROW_CLASS}
            >
              <Star className="size-4 shrink-0 text-muted-foreground" />
              Favorites
            </Link>
            <NewCollectionDialog
              trigger={<Button variant="ghost" className={QUICK_ACTION_ROW_CLASS} />}
            >
              <FolderPlus className="size-4 shrink-0 text-muted-foreground" />
              New Collection
            </NewCollectionDialog>
            {!user.isPro && (
              <Link
                href="/upgrade"
                onClick={() => setOpen(false)}
                className={QUICK_ACTION_ROW_CLASS}
              >
                <Sparkles className="size-4 shrink-0 text-muted-foreground" />
                Upgrade
              </Link>
            )}
          </nav>
          {/* Event delegation: closes the drawer when any SidebarNav link is clicked, without
              needing to thread a close callback through the shared (desktop-used-too) component. */}
          <div onClick={() => setOpen(false)}>
            <SidebarNav
              itemTypes={itemTypes}
              favoriteCollections={favoriteCollections}
              recentCollections={recentCollections}
              userIsPro={user.isPro}
              comfortable
            />
          </div>
        </div>
        <UserFooter user={user} />
      </SheetContent>
    </Sheet>
  );
}
