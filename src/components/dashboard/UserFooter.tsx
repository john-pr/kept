"use client";

import { signOut } from "next-auth/react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/db/users";

interface UserFooterProps {
  user: CurrentUser;
  collapsed?: boolean;
}

export function UserFooter({ user, collapsed = false }: UserFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-2 py-3",
        collapsed && "justify-center"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<button type="button" aria-label="User menu" />}
        >
          <UserAvatar name={user.name} image={user.image} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/sign-in" })}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {!collapsed && (
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </div>
      )}

      {!collapsed && (
        <Link href="/profile" aria-label="Profile">
          <Settings className="size-4 shrink-0 text-muted-foreground hover:text-foreground" />
        </Link>
      )}
    </div>
  );
}