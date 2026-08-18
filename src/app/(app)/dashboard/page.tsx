import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItemsSection } from "@/components/dashboard/PinnedItemsSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { getSessionUserId } from "@/lib/db/session";

export default async function DashboardPage() {
  const userId = await getSessionUserId();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      <StatsCards userId={userId} />
      <CollectionsSection userId={userId} />
      <PinnedItemsSection userId={userId} />
      <RecentItemsSection userId={userId} />
    </div>
  );
}
