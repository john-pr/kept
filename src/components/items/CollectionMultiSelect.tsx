"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface CollectionMultiSelectOption {
  id: string;
  name: string;
}

interface CollectionMultiSelectProps {
  options: CollectionMultiSelectOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionMultiSelect({ options, selectedIds, onChange }: CollectionMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("itemForm");

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id]
    );
  }

  const selectedNames = options
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.name);

  const triggerLabel =
    selectedNames.length === 0
      ? t("selectCollections")
      : selectedNames.length <= 2
        ? selectedNames.join(", ")
        : t("collectionsSelected", { count: selectedNames.length });

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        {t("collections")}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-[38px] w-full justify-between rounded-none border-border bg-muted text-[13px] font-normal"
              disabled={options.length === 0}
            />
          }
        >
          <span
            className={`truncate text-left ${
              selectedNames.length > 0 ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {options.length === 0 ? t("noCollectionsYet") : triggerLabel}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) p-0">
          <Command>
            <CommandInput
              placeholder={t("searchCollections")}
              aria-label={t("searchCollections")}
            />
            <CommandList>
              <CommandEmpty>{t("noCollectionsFound")}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => toggle(option.id)}
                  >
                    <Checkbox checked={selectedIds.includes(option.id)} />
                    {option.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
