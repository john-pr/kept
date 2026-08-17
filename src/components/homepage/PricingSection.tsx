import { ScrollFadeIn } from "./ScrollFadeIn";
import { PricingToggle } from "./PricingToggle";

const FREE_FEATURES = ["50 items total", "3 collections", "All text-based types", "Basic search"];

const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "File & image uploads",
  "AI auto-tagging & summaries",
  "Data export (JSON/ZIP)",
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-24">
      <ScrollFadeIn className="mx-auto mb-2 max-w-xl text-center">
        <span className="mb-3 inline-block text-[0.78rem] font-semibold tracking-wide text-primary uppercase">
          Pricing
        </span>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Simple, honest pricing
        </h2>
        <p className="text-muted-foreground">Start free. Upgrade when you outgrow it.</p>

        <PricingToggle freeFeatures={FREE_FEATURES} proFeatures={PRO_FEATURES} />
      </ScrollFadeIn>
    </section>
  );
}
