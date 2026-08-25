"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function HomeNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between gap-6 px-6">
        <Logo />

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

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            <span className="tracking-[0.14em] uppercase">Sign In</span>
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            <span className="tracking-[0.14em] uppercase">Get Started</span>
          </Button>
        </div>

        <button
          type="button"
          className="flex size-11 items-center justify-center text-foreground md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex min-h-[calc(100dvh_-_4.25rem)] flex-col gap-1 border-b border-border bg-background px-6 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase"
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="ghost"
            className="mt-2 justify-start"
            nativeButton={false}
            render={<Link href="/sign-in" onClick={() => setMobileOpen(false)} />}
          >
            <span className="tracking-[0.14em] uppercase">Sign In</span>
          </Button>
          <Button
            className="justify-start"
            nativeButton={false}
            render={<Link href="/register" onClick={() => setMobileOpen(false)} />}
          >
            <span className="tracking-[0.14em] uppercase">Get Started</span>
          </Button>
        </div>
      )}
    </header>
  );
}
