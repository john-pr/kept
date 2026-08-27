"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserFooter } from "@/components/dashboard/UserFooter";
import { cn } from "@/lib/utils";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionSummary } from "@/lib/db/collections";
import type { CurrentUser } from "@/lib/db/users";

interface SidebarProps {
  itemTypes: ItemTypeSummary[];
  favoriteCollections: CollectionSummary[];
  recentCollections: CollectionSummary[];
  user: CurrentUser;
}

export function Sidebar({ itemTypes, favoriteCollections, recentCollections, user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("appChrome");

  return (
    <aside
      className={cn(
        "hidden h-full flex-col overflow-hidden border-r border-border transition-all duration-200 lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border px-2 py-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <span className="px-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            {t("navigation")}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarNav
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          collapsed={collapsed}
          userIsPro={user.isPro}
        />
      </div>

      <UserFooter user={user} collapsed={collapsed} />
    </aside>
  );
}
