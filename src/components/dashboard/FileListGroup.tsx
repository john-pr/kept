import { FileListRow } from "@/components/dashboard/FileListRow";
import type { ItemSummary } from "@/lib/db/items";

export function FileListGroup({ items }: { items: ItemSummary[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border [&>*:last-child]:border-b-0">
      {items.map((item) => (
        <FileListRow key={item.id} item={item} />
      ))}
    </div>
  );
}
