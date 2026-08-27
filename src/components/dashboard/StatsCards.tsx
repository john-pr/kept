import { Package, FolderOpen, Star } from "lucide-react";
import type { DashboardStats } from "@/lib/db/stats";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cells = [
    { label: "Total Items", value: stats.totalItems, icon: Package },
    { label: "Collections", value: stats.totalCollections, icon: FolderOpen },
    { label: "Favorite Items", value: stats.favoriteItems, icon: Star },
    { label: "Favorite Collections", value: stats.favoriteCollections, icon: Star },
  ];

  return (
    <div className="grid grid-cols-2 gap-px border border-border bg-border lg:grid-cols-4">
      {cells.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex items-start justify-between gap-2 bg-card px-4 py-[18px]">
          <div className="flex flex-col gap-2">
            <span className="text-[32px] leading-none text-foreground tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
              {label}
            </span>
          </div>
          <Icon className="size-4 shrink-0 text-muted-foreground" />
        </div>
      ))}
    </div>
  );
}
