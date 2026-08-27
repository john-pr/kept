import Link from "next/link";
import { Logo } from "@/components/homepage/Logo";
import { Button } from "@/components/ui/button";

// Root-level 404 — renders outside the (app) shell (no TopBar/Sidebar), same as the
// auth pages. Replaces Next's bare unstyled "404 | This page could not be found."
// (ui-reviewer finding: jarring white page reachable from in-app links).
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-16 text-center">
      <Logo size="lg" />

      <div className="flex flex-col gap-3">
        <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
          Error / 404
        </p>
        <h1 className="text-xl font-medium tracking-[0.12em] text-foreground uppercase">
          Page not found
        </h1>
        <p className="max-w-sm text-sm text-ink-body">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
      </div>

      <Button
        nativeButton={false}
        render={<Link href="/dashboard" />}
        className="tracking-[0.14em] uppercase"
      >
        Back to dashboard
      </Button>
    </main>
  );
}
