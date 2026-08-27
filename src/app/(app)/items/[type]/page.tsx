import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Plus, Sparkles } from "lucide-react";
import { ItemCardGrid } from "@/components/dashboard/ItemCardGrid";
import { ImageThumbnailGrid } from "@/components/dashboard/ImageThumbnailGrid";
import { FileListGroup } from "@/components/dashboard/FileListGroup";
import { NewItemDialog } from "@/components/dashboard/NewItemDialog";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getItemTypes, getItemsByType } from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";
import { isPlanGatingEnabled } from "@/lib/plan-limits";
import { singularize } from "@/lib/text";

interface ItemsByTypePageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsByTypePage({ params, searchParams }: ItemsByTypePageProps) {
  const { type: slug } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const [itemTypes, collectionOptions] = await Promise.all([
    getItemTypes(userId),
    getCollectionOptions(userId),
  ]);

  const typeSummary = itemTypes.find((type) => type.slug === slug);

  if (!typeSummary) notFound();

  const isGatedFromType = isPlanGatingEnabled() && typeSummary.isPro && !session.user.isPro;

  const currentPage = getValidPage(Number(pageParam));
  const { items, totalCount } = isGatedFromType
    ? { items: [], totalCount: 0 }
    : await getItemsByType(
        typeSummary.id,
        userId,
        getPageSkip(currentPage, ITEMS_PER_PAGE),
        ITEMS_PER_PAGE
      );
  const totalPages = getPageCount(totalCount, ITEMS_PER_PAGE);
  const isImageGallery = typeSummary.slug === "images";
  const isFileList = typeSummary.slug === "files";
  const t = await getTranslations("itemsPage");

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize text-foreground">
          {typeSummary.slug}
        </h1>
        {!isGatedFromType && (
          <NewItemDialog
            itemTypes={itemTypes}
            collectionOptions={collectionOptions}
            defaultItemTypeId={typeSummary.id}
            isPro={session.user.isPro}
            trigger={<Button />}
          >
            <Plus />
            {t("addType", { type: singularize(typeSummary.name) })}
          </NewItemDialog>
        )}
      </div>
      {isGatedFromType ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {t("proFeatureHeading", { type: typeSummary.name })}
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t("proFeatureBody", { slug: typeSummary.slug })}
          </p>
          <Button render={<Link href="/settings" />} nativeButton={false}>
            {t("upgradeToPro")}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noItems")}</p>
      ) : isImageGallery ? (
        <ImageThumbnailGrid items={items} />
      ) : isFileList ? (
        <FileListGroup items={items} />
      ) : (
        <ItemCardGrid items={items} />
      )}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={`/items/${typeSummary.slug}`}
      />
    </div>
  );
}
