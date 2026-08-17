"use client";

import { signOut } from "next-auth/react";
import { User, Settings, LogOut } from "lucide-react";
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
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
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
    </div>
  );
}