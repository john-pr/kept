"use client";

import type { MouseEvent } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIVE_COLOR_CLASS = {
  yellow: "fill-yellow-400 text-yellow-400",
  primary: "fill-primary text-primary",
};

interface FavoriteToggleButtonProps {
  isFavorite: boolean;
  onToggle: (event: MouseEvent) => void;
  /** Fill/text color when favorited. "yellow" (default) matches items; "primary"
   * is the ledger accent green, used by `CollectionCard`. The item/collection split
   * is deliberate (items = yellow star, collections = green star) — a ui-reviewer
   * pass flagged it as an inconsistency; kept intentionally, not a bug. */
  color?: keyof typeof ACTIVE_COLOR_CLASS;
}

/** Shared favorite-star toggle button used by item cards/rows and collection cards. */
export function FavoriteToggleButton({
  isFavorite,
  onToggle,
  color = "yellow",
}: FavoriteToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={onToggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={isFavorite ? `size-3.5 ${ACTIVE_COLOR_CLASS[color]}` : "size-3.5"} />
    </Button>
  );
}
