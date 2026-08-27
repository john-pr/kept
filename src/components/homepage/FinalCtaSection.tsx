import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn } from "./ScrollFadeIn";

export async function FinalCtaSection() {
  const t = await getTranslations("home.finalCta");

  return (
    <section className="border-t border-border px-6 py-24 text-center">
      <ScrollFadeIn>
        <h2 className="mb-3.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("heading")}
        </h2>
        <p className="mx-auto mb-7 max-w-md text-muted-foreground">
          {t("subtitle")}
        </p>
        <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
          <span className="tracking-[0.14em] uppercase">{t("cta")}</span>
        </Button>
      </ScrollFadeIn>
    </section>
  );
}
