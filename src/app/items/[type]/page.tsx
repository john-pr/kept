import { notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { getItemTypes, getItemTypeBySlug, getItemsByType } from "@/lib/db/items";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({ params }: ItemsByTypePageProps) {
  const { type: slug } = await params;

  const [itemTypes, favoriteCollections, recentCollections, user, itemType] = await Promise.all([
    getItemTypes(),
    getFavoriteCollections(),
    getRecentCollections(6),
    getCurrentUser(),
    getItemTypeBySlug(slug),
  ]);

  if (!itemType) notFound();

  const items = await getItemsByType(itemType.id);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        user={user}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold capitalize text-foreground">{itemType.slug}</h1>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}