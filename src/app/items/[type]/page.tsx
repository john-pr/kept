import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Button } from "@/components/ui/button";
import { getAllItemsForSearch, getItemTypes, getItemsByType } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";

function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsByTypePage({ params, searchParams }: ItemsByTypePageProps) {
  const { type: slug } = await params;
  const { page: pageParam } = await searchParams;

  const user = await getCurrentUser();
  const [itemTypes, favoriteCollections, recentCollections, collectionOptions, searchItems, searchCollections] =
    await Promise.all([
      getItemTypes(user.id),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id),
      getCollectionOptions(user.id),
      getAllItemsForSearch(user.id),
      getCollectionsForSearch(user.id),
    ]);

  const typeSummary = itemTypes.find((type) => type.slug === slug);

  if (!typeSummary) notFound();

  const currentPage = getValidPage(Number(pageParam));
  const { items, totalCount } = await getItemsByType(
    typeSummary.id,
    user.id,
    getPageSkip(currentPage, ITEMS_PER_PAGE),
    ITEMS_PER_PAGE
  );
  const totalPages = getPageCount(totalCount, ITEMS_PER_PAGE);
  const isImageGallery = typeSummary.slug === "images";
  const isFileList = typeSummary.slug === "files";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        collectionOptions={collectionOptions}
        searchItems={searchItems}
        searchCollections={searchCollections}
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
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold capitalize text-foreground">
                {typeSummary.slug}
              </h1>
              <NewItemDialog
                itemTypes={itemTypes}
                collectionOptions={collectionOptions}
                defaultItemTypeId={typeSummary.id}
                trigger={<Button />}
              >
                <Plus />
                Add {singularize(typeSummary.name)}
              </NewItemDialog>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items yet.</p>
            ) : isImageGallery ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ImageThumbnailCard key={item.id} item={item} />
                ))}
              </div>
            ) : isFileList ? (
              <div className="rounded-xl border border-border [&>*:last-child]:border-b-0">
                {items.map((item) => (
                  <FileListRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/items/${typeSummary.slug}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}