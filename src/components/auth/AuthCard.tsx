import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  /** Optional "Access / Sign in"-style breadcrumb row above the card. Both must be set to render. */
  crumb?: string;
  stepLabel?: string;
}

/** Shared `w-full max-w-sm` card skeleton used by every auth page. */
export function AuthCard({ title, description, children, contentClassName, crumb, stepLabel }: AuthCardProps) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {crumb && stepLabel && (
        <div className="flex items-baseline justify-between border-b border-rule-strong pb-2.5">
          <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">{crumb}</span>
          <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
            {stepLabel}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-[22px] border border-border border-l-2 border-l-primary bg-card px-7 pt-7 pb-6">
        <div className="flex flex-col gap-2 border-b border-dotted border-border pb-[18px]">
          <h1 className="text-lg font-medium tracking-[0.12em] text-foreground uppercase">{title}</h1>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className={contentClassName}>{children}</div>
      </div>
    </div>
  );
}
