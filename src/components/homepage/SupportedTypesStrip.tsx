"use client";

import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { withAlpha } from "@/lib/color";
import { useSoftTintAlpha } from "@/hooks/useSoftTintAlpha";

// The app's real 7 system item types (context/project-overview.md §3.1), colored with their
// actual per-type accent (same hex values as ItemType.color / FeaturesSection) via a soft-tint
// icon chip — matching the chip pattern used for type badges elsewhere in the app (ItemCard,
// SidebarNav, CollectionCard, ItemDrawer).
const SUPPORTED_TYPES: { label: string; icon: LucideIcon; color: string }[] = [
  { label: "Snippets", icon: Code, color: "#3b82f6" },
  { label: "Prompts", icon: Sparkles, color: "#8b5cf6" },
  { label: "Commands", icon: Terminal, color: "#f97316" },
  { label: "Notes", icon: StickyNote, color: "#fde047" },
  { label: "Links", icon: LinkIcon, color: "#10b981" },
  { label: "Files", icon: File, color: "#6b7280" },
  { label: "Images", icon: ImageIcon, color: "#ec4899" },
];

export function SupportedTypesStrip() {
  const alphaSuffix = useSoftTintAlpha();

  return (
    <div className="border-y border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {SUPPORTED_TYPES.map(({ label, icon: Icon, color }) => (
          <span key={label} className="flex items-center gap-2 text-muted-foreground">
            <span
              className="flex size-6 shrink-0 items-center justify-center"
              style={{ backgroundColor: withAlpha(color, alphaSuffix) }}
            >
              <Icon className="size-3.5" style={{ color }} />
            </span>
            <span className="text-[11px] tracking-[0.14em] uppercase">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
