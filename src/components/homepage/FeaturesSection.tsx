import { Code, Sparkles, Search, Terminal, File, Layers, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { withAlpha } from "@/lib/color";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { SectionEyebrow } from "./SectionEyebrow";

// Reuses the real ItemType accent colors (context/project-overview.md §3.1) rather than
// inventing a separate marketing palette. Search/Collections aren't item types themselves,
// so they borrow an unused-elsewhere accent from the same set. Copy comes from the
// `home.features.<key>` message namespace.
const FEATURES: { key: string; icon: LucideIcon; accent: string }[] = [
  { key: "codeSnippets", icon: Code, accent: "#3b82f6" },
  { key: "aiPrompts", icon: Sparkles, accent: "#8b5cf6" },
  { key: "instantSearch", icon: Search, accent: "#10b981" },
  { key: "commands", icon: Terminal, accent: "#f97316" },
  { key: "filesDocs", icon: File, accent: "#6b7280" },
  { key: "collections", icon: Layers, accent: "#ec4899" },
];

export async function FeaturesSection() {
  const t = await getTranslations("home.features");

  return (
    <section id="features" className="scroll-mt-17 px-6 py-24">
      <ScrollFadeIn className="mx-auto mb-13 max-w-xl text-center">
        <SectionEyebrow className="mb-3">{t("eyebrow")}</SectionEyebrow>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </ScrollFadeIn>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <ScrollFadeIn key={feature.key} delay={i * 60}>
            <div className="h-full bg-card p-6.5 transition-colors hover:bg-muted">
              <div
                className="mb-4 flex size-11 items-center justify-center rounded-none"
                style={{ color: feature.accent, backgroundColor: withAlpha(feature.accent, "24") }}
              >
                <feature.icon className="size-5.5" />
              </div>
              <h3 className="mb-1.5 font-bold">{t(`${feature.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`${feature.key}.description`)}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </section>
  );
}
