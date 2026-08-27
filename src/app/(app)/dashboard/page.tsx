import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItemsSection } from "@/components/dashboard/PinnedItemsSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { getSessionUserId } from "@/lib/db/session";
import { getDashboardStats } from "@/lib/db/stats";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  const stats = await getDashboardStats(userId);

  return (
    <div className="mx-auto max-w-7xl space-y-9 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-rule-strong pb-3.5">
        <h1 className="text-xl font-medium tracking-[0.18em] text-foreground uppercase">
          Dashboard
        </h1>
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
          Ledger / {stats.totalItems} records
        </span>
      </div>
      <StatsCards stats={stats} />
      <CollectionsSection userId={userId} />
      <PinnedItemsSection userId={userId} />
      <RecentItemsSection userId={userId} />
    </div>
  );
}
