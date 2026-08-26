import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  name: string;
  image?: string | null;
  size?: "default" | "sm" | "lg";
  /** "square" matches the ledger design system's bordered initials box (kept-dashboard.html's
   * user-menu trigger) — used only by `UserFooter.tsx`. Defaults to the original circular
   * shape everywhere else (e.g. `/profile`). `rounded-full` sits outside the app's `--radius`
   * token chain, so it needs an explicit override rather than flattening for free. */
  shape?: "circle" | "square";
  className?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  name,
  image,
  size = "default",
  shape = "circle",
  className,
}: UserAvatarProps) {
  const isSquare = shape === "square";

  return (
    <Avatar
      size={size}
      className={cn(isSquare && "rounded-none after:rounded-none", className)}
    >
      {image && <AvatarImage src={image} alt={name} className={cn(isSquare && "rounded-none")} />}
      <AvatarFallback className={cn(isSquare && "rounded-none")}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}