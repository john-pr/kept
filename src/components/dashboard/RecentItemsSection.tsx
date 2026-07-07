import { getRecentItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";

export async function RecentItemsSection() {
  const recentItems = await getRecentItems(9);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Recent Items</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
