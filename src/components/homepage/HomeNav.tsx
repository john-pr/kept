"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function HomeNav() {
  const pathname = usePathname();
  const isSignIn = pathname === "/sign-in";
  const isRegister = pathname === "/register";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo size="lg" />

        <nav className="ml-auto hidden gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            className="h-9 gap-1 px-2 text-[0.78rem] md:h-8 md:gap-1.5 md:px-2.5 md:text-sm"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            <span
              className={cn(
                "tracking-[0.08em] uppercase sm:tracking-[0.14em]",
                isSignIn && "underline underline-offset-4"
              )}
            >
              Sign In
            </span>
          </Button>
          <Button
            className="h-9 gap-1 px-2 text-[0.78rem] md:h-8 md:gap-1.5 md:px-2.5 md:text-sm"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            <span
              className={cn(
                "tracking-[0.08em] uppercase sm:tracking-[0.14em]",
                isRegister && "underline underline-offset-4"
              )}
            >
              <span className="md:hidden">Sign Up</span>
              <span className="hidden md:inline">Get Started</span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
