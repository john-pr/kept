"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { useHasMounted } from "@/hooks/useHasMounted";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/db/users";

interface UserFooterProps {
  user: CurrentUser;
  collapsed?: boolean;
}

// Matches ItemDrawerView's dotted-divider section-label convention and the sidebar's
// uppercase/tracked row labels — see context/design-system.md.
const SECTION_LABEL_CLASS = "text-[10px] tracking-[0.14em] text-muted-foreground uppercase";
const MENU_ITEM_CLASS = "rounded-none px-2 py-2 text-[11px] tracking-[0.12em] uppercase";
const APPEARANCE_OPTION_CLASS =
  "flex-1 cursor-pointer py-1.5 text-[10px] tracking-[0.12em] uppercase transition-colors";

export function UserFooter({ user, collapsed = false }: UserFooterProps) {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("appChrome");
  // next-themes can't know the persisted preference during SSR, so `theme` is undefined
  // until after mount — guard the Light/Dark highlight to avoid a hydration mismatch
  // (both render unhighlighted pre-mount, matching the server-rendered markup).
  const mounted = useHasMounted();

  function stopAndSetTheme(next: string) {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      setTheme(next);
    };
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-2 py-3",
        collapsed && "justify-center"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<button type="button" aria-label={t("userMenu")} className="cursor-pointer" />}
        >
          <UserAvatar
            name={user.name}
            image={user.image}
            shape="square"
            fallbackClassName="text-[11px] tracking-[0.08em]"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 rounded-none border border-rule-strong p-0 shadow-none ring-0"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel
              className={cn(
                SECTION_LABEL_CLASS,
                "border-b border-dotted border-border px-3 py-2.5"
              )}
            >
              {t("account")}
            </DropdownMenuLabel>

            <div className="p-1">
              <DropdownMenuItem render={<Link href="/profile" />} className={MENU_ITEM_CLASS}>
                <User className="size-4" />
                {t("profile")}
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/settings" />} className={MENU_ITEM_CLASS}>
                <Settings className="size-4" />
                {t("settings")}
              </DropdownMenuItem>
            </div>
          </DropdownMenuGroup>

          <div className="flex flex-col gap-3 border-y border-border px-3 py-2.5">
            <div className="flex flex-col gap-2">
              <span className={SECTION_LABEL_CLASS}>{t("appearance")}</span>
              <div className="flex border border-border">
                <button
                  type="button"
                  onClick={stopAndSetTheme("light")}
                  className={cn(
                    APPEARANCE_OPTION_CLASS,
                    "border-r border-border",
                    mounted && theme === "light"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("light")}
                </button>
                <button
                  type="button"
                  onClick={stopAndSetTheme("dark")}
                  className={cn(
                    APPEARANCE_OPTION_CLASS,
                    mounted && theme === "dark"
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("dark")}
                </button>
              </div>
            </div>
            <LanguageSwitcher variant="segmented" />
          </div>

          <div className="p-1">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={MENU_ITEM_CLASS}
            >
              <LogOut className="size-4" />
              {t("signOut")}
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-xs font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">
            {user.email}
          </span>
        </div>
      )}
    </div>
  );
}
