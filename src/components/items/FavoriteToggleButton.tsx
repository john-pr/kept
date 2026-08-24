"use client";

import type { MouseEvent } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteToggleButtonProps {
  isFavorite: boolean;
  onToggle: (event: MouseEvent) => void;
}

/** Shared favorite-star toggle button used by item cards/rows. */
export function FavoriteToggleButton({ isFavorite, onToggle }: FavoriteToggleButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={onToggle}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={isFavorite ? "size-3.5 fill-yellow-400 text-yellow-400" : "size-3.5"} />
    </Button>
  );
}
