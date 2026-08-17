import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { ChaosToOrder } from "./ChaosToOrder";

export function HeroSection() {
  return (
    <section className="px-6 pt-38 pb-24">
      <ScrollFadeIn className="mx-auto mb-16 max-w-2xl text-center">
        <span className="mb-5 inline-block rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[0.78rem] font-semibold tracking-wide text-primary uppercase">
          Built for developers
        </span>
        <h1 className="mb-5 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Stop Losing Your{" "}
          <span className="bg-gradient-to-br from-[#3b82f6] via-[#ec4899] to-[#f59e0b] bg-clip-text text-transparent">
            Developer Knowledge
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-lg text-lg text-muted-foreground">
          Snippets, prompts, commands, notes, and links — scattered across a dozen tools. DevStash
          brings it all into one fast, searchable, AI-enhanced hub.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get Started Free
          </Button>
          <Button size="lg" variant="ghost" nativeButton={false} render={<Link href="#features" />}>
            See Features
          </Button>
        </div>
      </ScrollFadeIn>

      <ScrollFadeIn>
        <ChaosToOrder />
      </ScrollFadeIn>
    </section>
  );
}
