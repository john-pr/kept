import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollFadeIn } from "./ScrollFadeIn";

export function FinalCtaSection() {
  return (
    <section className="border-t border-border bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] px-6 py-24 text-center">
      <ScrollFadeIn>
        <h2 className="mb-3.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Ready to Organize Your Knowledge?
        </h2>
        <p className="mx-auto mb-7 max-w-md text-muted-foreground">
          Join developers who stopped losing snippets, prompts, and notes to a dozen scattered
          tools.
        </p>
        <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
          Get Started Free
        </Button>
      </ScrollFadeIn>
    </section>
  );
}
