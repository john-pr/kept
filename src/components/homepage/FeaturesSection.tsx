import { Code, Sparkles, Search, Terminal, File, Layers, type LucideIcon } from "lucide-react";
import { withAlpha } from "@/lib/color";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { SectionEyebrow } from "./SectionEyebrow";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
}

// Reuses the real ItemType accent colors (context/project-overview.md §3.1) rather than
// inventing a separate marketing palette. Search/Collections aren't item types themselves,
// so they borrow an unused-elsewhere accent from the same set.
const FEATURES: Feature[] = [
  {
    title: "Code Snippets",
    description: "Save reusable code with syntax highlighting and language tagging.",
    icon: Code,
    accent: "#3b82f6",
  },
  {
    title: "AI Prompts",
    description: "Keep your best prompts organized, versioned, and ready to reuse.",
    icon: Sparkles,
    accent: "#8b5cf6",
  },
  {
    title: "Instant Search",
    description: "Full-text search across content, tags, titles, and types — instantly.",
    icon: Search,
    accent: "#10b981",
  },
  {
    title: "Commands",
    description: "Never forget that one CLI flag again — save and search your commands.",
    icon: Terminal,
    accent: "#f97316",
  },
  {
    title: "Files & Docs",
    description: "Attach files and images alongside everything else they belong with.",
    icon: File,
    accent: "#6b7280",
  },
  {
    title: "Collections",
    description: "Group anything, of any type, into collections that match your workflow.",
    icon: Layers,
    accent: "#ec4899",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-17 px-6 py-24">
      <ScrollFadeIn className="mx-auto mb-13 max-w-xl text-center">
        <SectionEyebrow className="mb-3">Features</SectionEyebrow>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Everything, Kept
        </h2>
        <p className="text-muted-foreground">
          Snippets, prompts, commands, notes, links, and files — organized the way you actually
          think, not the way a dozen different tools force you to.
        </p>
      </ScrollFadeIn>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <ScrollFadeIn key={feature.title} delay={i * 60}>
            <div className="h-full bg-card p-6.5 transition-colors hover:bg-muted">
              <div
                className="mb-4 flex size-11 items-center justify-center rounded-none"
                style={{ color: feature.accent, backgroundColor: withAlpha(feature.accent, "24") }}
              >
                <feature.icon className="size-5.5" />
              </div>
              <h3 className="mb-1.5 font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </section>
  );
}
