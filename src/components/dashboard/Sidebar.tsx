"use client";

import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserFooter } from "@/components/dashboard/UserFooter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-full flex-col overflow-hidden border-r border-border transition-all duration-200 md:flex",
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
          <span className="px-2 text-xs font-medium tracking-wide text-muted-foreground">
            Navigation
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <UserFooter collapsed={collapsed} />
    </aside>
  );
}
