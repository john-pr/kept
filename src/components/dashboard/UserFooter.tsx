import { Settings } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { user } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface UserFooterProps {
  collapsed?: boolean;
}

export function UserFooter({ collapsed = false }: UserFooterProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-2 border-t border-border px-2 py-3",
        collapsed && "justify-center"
      )}
    >
      <Avatar>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
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
        <Settings className="size-4 shrink-0 text-muted-foreground" />
      )}
    </div>
  );
}