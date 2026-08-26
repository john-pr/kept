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

// The app's real 7 system item types (context/project-overview.md §3.1), shown muted/gray
// rather than with their usual vivid per-type colors — a understated "everything it holds"
// strip, not a marketing claim, so intentionally desaturated.
const SUPPORTED_TYPES: { label: string; icon: LucideIcon }[] = [
  { label: "Snippets", icon: Code },
  { label: "Prompts", icon: Sparkles },
  { label: "Commands", icon: Terminal },
  { label: "Notes", icon: StickyNote },
  { label: "Links", icon: LinkIcon },
  { label: "Files", icon: File },
  { label: "Images", icon: ImageIcon },
];

export function SupportedTypesStrip() {
  return (
    <div className="border-y border-border px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {SUPPORTED_TYPES.map(({ label, icon: Icon }) => (
          <span key={label} className="flex items-center gap-2 text-muted-foreground">
            <Icon className="size-4" />
            <span className="text-[11px] tracking-[0.14em] uppercase">{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
