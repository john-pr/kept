"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, FolderOpen, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { iconMap } from "@/lib/icon-map";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import type { ItemSearchEntry } from "@/lib/db/items";
import type { CollectionSearchEntry } from "@/lib/db/collections";

interface GlobalSearchProps {
  items: ItemSearchEntry[];
  collections: CollectionSearchEntry[];
  /** Controlled open state — lets `TopBar`'s mobile search icon open the same dialog as this
   * component's own trigger bar. Falls back to internal state when omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ items, collections, open: openProp, onOpenChange }: GlobalSearchProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const router = useRouter();
  const { openItem } = useItemDrawer();
  const t = useTranslations("search");
  const tc = useTranslations("common");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(!open);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  function handleSelectItem(id: string) {
    setOpen(false);
    openItem(id);
  }

  function handleSelectCollection(id: string) {
    setOpen(false);
    router.push(`/collections/${id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-muted-foreground shadow-xs transition-colors hover:bg-accent/50"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">{t("placeholder")}</span>
        <CommandShortcut className="hidden sm:inline">⌘K</CommandShortcut>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t("title")} description={t("description")}>
        <Command>
          <CommandInput placeholder={t("placeholder")} />
          <CommandList className="max-h-96 px-1 pb-1">
            <CommandEmpty className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
              <Search className="size-5 opacity-50" />
              {t("noResults")}
            </CommandEmpty>
            {items.length > 0 && (
              <CommandGroup heading={t("items")}>
                {items.map((item) => {
                  const Icon = iconMap[item.typeIcon];
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.contentPreview} ${item.typeName}`}
                      onSelect={() => handleSelectItem(item.id)}
                      className="gap-3 py-2"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        {Icon && <Icon className="size-3.5" style={{ color: item.typeColor }} />}
                      </span>
                      <span className="truncate">{item.title}</span>
                      <Badge
                        variant="outline"
                        data-slot="command-shortcut"
                        className="ml-auto shrink-0 text-muted-foreground"
                      >
                        {item.typeName}
                      </Badge>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
            {items.length > 0 && collections.length > 0 && <CommandSeparator className="my-1" />}
            {collections.length > 0 && (
              <CommandGroup heading={t("collections")}>
                {collections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    value={collection.name}
                    onSelect={() => handleSelectCollection(collection.id)}
                    className="gap-3 py-2"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <FolderOpen className="size-3.5 text-muted-foreground" />
                    </span>
                    <span className="truncate">{collection.name}</span>
                    <span
                      data-slot="command-shortcut"
                      className="ml-auto shrink-0 text-xs text-muted-foreground"
                    >
                      {tc("itemCount", { count: collection.itemCount })}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
          <div className="flex items-center gap-4 border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <kbd className="flex size-4 items-center justify-center rounded border border-border bg-muted">
                <ArrowUp className="size-2.5" />
              </kbd>
              <kbd className="flex size-4 items-center justify-center rounded border border-border bg-muted">
                <ArrowDown className="size-2.5" />
              </kbd>
              {t("navigate")}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="flex size-4 items-center justify-center rounded border border-border bg-muted">
                <CornerDownLeft className="size-2.5" />
              </kbd>
              {t("select")}
            </span>
            <span className="ml-auto flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">esc</kbd>
              {t("close")}
            </span>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
}
