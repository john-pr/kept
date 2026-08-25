import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { ChaosToOrder } from "./ChaosToOrder";
import { SectionEyebrow } from "./SectionEyebrow";

export function HeroSection() {
  return (
    <section className="px-6 pt-38 pb-8">
      <ScrollFadeIn className="mx-auto mb-16 max-w-2xl text-center">
        <SectionEyebrow className="mb-5 block">Built for developers</SectionEyebrow>
        <h1 className="mb-5 text-3xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="block text-primary">Keep Everything.</span>
          <span className="block text-balance">Find Anything.</span>
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
          Snippets, prompts, commands, notes, links, and files — kept in one fast, searchable,
          AI-enhanced hub instead of scattered across a dozen different tools.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            <span className="tracking-[0.14em] uppercase">Get Started Free</span>
          </Button>
          <Button size="lg" variant="ghost" nativeButton={false} render={<Link href="#features" />}>
            <span className="tracking-[0.14em] uppercase">See Features</span>
          </Button>
        </div>
      </ScrollFadeIn>

      <ScrollFadeIn>
        <ChaosToOrder />
      </ScrollFadeIn>
    </section>
  );
}
