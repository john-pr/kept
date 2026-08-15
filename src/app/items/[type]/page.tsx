import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { Button } from "@/components/ui/button";
import { getItemTypes, getItemsByType } from "@/lib/db/items";
import { getCollectionOptions, getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";

function singularize(name: string): string {
  return name.endsWith("s") ? name.slice(0, -1) : name;
}

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({ params }: ItemsByTypePageProps) {
  const { type: slug } = await params;

  const user = await getCurrentUser();
  const [itemTypes, favoriteCollections, recentCollections, collectionOptions] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 6),
    getCollectionOptions(user.id),
  ]);

  const typeSummary = itemTypes.find((type) => type.slug === slug);

  if (!typeSummary) notFound();

  const items = await getItemsByType(typeSummary.id, user.id);
  const isImageGallery = typeSummary.slug === "images";
  const isFileList = typeSummary.slug === "files";

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        collectionOptions={collectionOptions}
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
          </div>
        </main>
      </div>
    </div>
  );
}