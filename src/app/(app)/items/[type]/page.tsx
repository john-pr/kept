import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Button } from "@/components/ui/button";
import { getItemTypes, getItemsByType } from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";
import { getSessionUserId } from "@/lib/db/session";
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

  const userId = await getSessionUserId();
  const [itemTypes, collectionOptions] = await Promise.all([
    getItemTypes(userId),
    getCollectionOptions(userId),
  ]);

  const typeSummary = itemTypes.find((type) => type.slug === slug);

  if (!typeSummary) notFound();

  const currentPage = getValidPage(Number(pageParam));
  const { items, totalCount } = await getItemsByType(
    typeSummary.id,
    userId,
    getPageSkip(currentPage, ITEMS_PER_PAGE),
    ITEMS_PER_PAGE
  );
  const totalPages = getPageCount(totalCount, ITEMS_PER_PAGE);
  const isImageGallery = typeSummary.slug === "images";
  const isFileList = typeSummary.slug === "files";

  return (
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
  );
}
