import { notFound } from "next/navigation";
import { ItemCardGrid } from "@/components/dashboard/ItemCardGrid";
import { ImageThumbnailGrid } from "@/components/dashboard/ImageThumbnailGrid";
import { FileListGroup } from "@/components/dashboard/FileListGroup";
import { CollectionDetailHeader } from "@/components/dashboard/CollectionDetailHeader";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { getItemsByCollection } from "@/lib/db/items";
import { getCollectionById } from "@/lib/db/collections";
import { getSessionUserId } from "@/lib/db/session";
import { groupItemsByType } from "@/lib/item-grouping";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: CollectionDetailPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = getValidPage(Number(pageParam));

  const userId = await getSessionUserId();
  const [collection, { items, totalCount }] = await Promise.all([
    getCollectionById(id, userId),
    getItemsByCollection(id, userId, getPageSkip(currentPage, ITEMS_PER_PAGE), ITEMS_PER_PAGE),
  ]);

  if (!collection) notFound();

  const totalPages = getPageCount(totalCount, ITEMS_PER_PAGE);
  const { imageItems, fileItems, otherItems } = groupItemsByType(items);

  const sections = [
    { label: "Items", items: otherItems, Grid: ItemCardGrid },
    { label: "Images", items: imageItems, Grid: ImageThumbnailGrid },
    { label: "Files", items: fileItems, Grid: FileListGroup },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <CollectionDetailHeader collection={collection} />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
      ) : (
        <div className="space-y-8">
          {sections.map(({ label, items: sectionItems, Grid }) =>
            sectionItems.length > 0 ? (
              <section key={label} className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-foreground">{label}</h3>
                <Grid items={sectionItems} />
              </section>
            ) : null
          )}
        </div>
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/collections/${collection.id}`}
      />
    </div>
  );
}
