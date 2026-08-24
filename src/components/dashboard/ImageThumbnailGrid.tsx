import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import type { ItemSummary } from "@/lib/db/items";

export function ImageThumbnailGrid({ items }: { items: ItemSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ImageThumbnailCard key={item.id} item={item} />
      ))}
    </div>
  );
}
