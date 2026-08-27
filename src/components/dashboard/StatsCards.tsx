import { Package, FolderOpen, Star } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { DashboardStats } from "@/lib/db/stats";

interface StatsCardsProps {
  stats: DashboardStats;
}

export async function StatsCards({ stats }: StatsCardsProps) {
  const t = await getTranslations("dashboard");

  const cells = [
    { label: t("totalItems"), value: stats.totalItems, icon: Package },
    { label: t("collections"), value: stats.totalCollections, icon: FolderOpen },
    { label: t("favoriteItems"), value: stats.favoriteItems, icon: Star },
    { label: t("favoriteCollections"), value: stats.favoriteCollections, icon: Star },
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
