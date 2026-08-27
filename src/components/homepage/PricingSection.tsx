import { getTranslations } from "next-intl/server";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { PricingToggle } from "./PricingToggle";
import { SectionEyebrow } from "./SectionEyebrow";

export async function PricingSection() {
  const t = await getTranslations("home.pricing");

  return (
    <section id="pricing" className="scroll-mt-17 px-6 py-24">
      <ScrollFadeIn className="mx-auto mb-2 max-w-xl text-center">
        <SectionEyebrow className="mb-3">{t("eyebrow")}</SectionEyebrow>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="text-muted-foreground">{t("subtitle")}</p>

        <PricingToggle />
      </ScrollFadeIn>
    </section>
  );
}
