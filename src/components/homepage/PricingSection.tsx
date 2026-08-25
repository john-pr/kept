import { ScrollFadeIn } from "./ScrollFadeIn";
import { PricingToggle } from "./PricingToggle";
import { SectionEyebrow } from "./SectionEyebrow";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/pricing-features";

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-17 px-6 py-24">
      <ScrollFadeIn className="mx-auto mb-2 max-w-xl text-center">
        <SectionEyebrow className="mb-3">Pricing</SectionEyebrow>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Simple, honest pricing
        </h2>
        <p className="text-muted-foreground">Start free. Upgrade when you outgrow it.</p>

        <PricingToggle freeFeatures={FREE_FEATURES} proFeatures={PRO_FEATURES} />
      </ScrollFadeIn>
    </section>
  );
}
