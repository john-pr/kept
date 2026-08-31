"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

const SECTION_LABEL_CLASS = "text-[10px] tracking-[0.14em] text-muted-foreground uppercase";

export function HomeNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const isSignIn = pathname === "/sign-in";
  const isRegister = pathname === "/register";

  const navLinks = [
    { href: "/#features", label: t("features") },
    { href: "/#pricing", label: t("pricing") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-17 max-w-6xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6">
        <Logo size="lg" />

        <nav className="ml-auto hidden gap-7 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            className="h-9 min-w-0 gap-1 px-1.5 text-[0.72rem] md:h-8 md:gap-1.5 md:px-2.5 md:text-sm"
            nativeButton={false}
            render={<Link href="/sign-in" />}
          >
            {/* Longer locales (e.g. PL "Zaloguj się") get clipped with an ellipsis on
                mobile so the auth CTAs + kebab still fit a ~360px bar. */}
            <span
              className={cn(
                "block max-w-28 truncate tracking-normal uppercase sm:max-w-none sm:tracking-[0.14em]",
                isSignIn && "underline underline-offset-4"
              )}
            >
              {t("signIn")}
            </span>
          </Button>
          <Button
            className="h-9 min-w-0 gap-1 px-1.5 text-[0.72rem] md:h-8 md:gap-1.5 md:px-2.5 md:text-sm"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            <span
              className={cn(
                "block max-w-28 truncate tracking-normal uppercase sm:max-w-none sm:tracking-[0.14em]",
                isRegister && "underline underline-offset-4"
              )}
            >
              <span className="md:hidden">{t("signUp")}</span>
              <span className="hidden md:inline">{t("getStarted")}</span>
            </span>
          </Button>

          {/* Desktop: language + theme sit just past the auth CTAs up to 2xl; on
              wide screens they detach to the header's right edge so the centre
              cluster stops feeling crowded. */}
          <div className="hidden items-center md:flex 2xl:absolute 2xl:top-1/2 2xl:right-6 2xl:-translate-y-1/2">
            <span aria-hidden className="mx-1 h-5 w-px bg-border 2xl:hidden" />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: language + theme tuck into a compact kebab menu. */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label={t("menu")}
                  className="-mr-1 flex size-9 cursor-pointer items-center justify-center text-muted-foreground transition-colors hover:text-foreground md:hidden"
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-none border border-rule-strong p-0 shadow-none ring-0"
            >
              <div className="flex flex-col gap-3 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={SECTION_LABEL_CLASS}>{t("theme")}</span>
                  <ThemeToggle />
                </div>
                <LanguageSwitcher variant="segmented" />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
