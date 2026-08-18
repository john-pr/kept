import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { getAllCollections } from "@/lib/db/collections";
import { getSessionUserId } from "@/lib/db/session";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";

interface CollectionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = getValidPage(Number(pageParam));

  const userId = await getSessionUserId();
  const { collections: allCollections, totalCount } = await getAllCollections(
    userId,
    getPageSkip(currentPage, COLLECTIONS_PER_PAGE),
    COLLECTIONS_PER_PAGE
  );

  const totalPages = getPageCount(totalCount, COLLECTIONS_PER_PAGE);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
      {allCollections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allCollections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath="/collections" />
    </div>
  );
}
