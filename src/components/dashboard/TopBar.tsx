import { Search, FolderPlus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function TopBar() {
  return (
    <header className="grid grid-cols-3 items-center gap-4 border-b border-border px-4 py-3">
      <div />
      <div className="relative mx-auto w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search items, collections, tags..." className="pl-9" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline">
          <FolderPlus />
          New Collection
        </Button>
        <Button>
          <Plus />
          New Item
        </Button>
      </div>
    </header>
  );
}