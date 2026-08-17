"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent backdrop-blur-sm transition-colors duration-300",
        scrolled ? "border-border bg-background/95" : "bg-background/40"
      )}
    >
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between gap-6 px-6">
        <Logo />

        <nav className="ml-auto hidden gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign In
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="p-1.5 text-foreground md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col gap-1 border-b border-border bg-background px-6 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm font-medium text-muted-foreground"
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
            Sign In
          </Button>
          <Button
            className="justify-start"
            nativeButton={false}
            render={<Link href="/register" onClick={() => setMobileOpen(false)} />}
          >
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
}
