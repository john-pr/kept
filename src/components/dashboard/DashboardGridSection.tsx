import type { ReactNode } from "react";

interface DashboardGridSectionProps {
  title: string;
  count: number;
  children: ReactNode;
}

/** Shared "titled grid" shape used by the dashboard's pinned/recent items and recent collections sections. */
export function DashboardGridSection({ title, count, children }: DashboardGridSectionProps) {
  return (
    <section className="flex flex-col gap-px">
      <div className="flex items-baseline justify-between border-b border-rule-strong pb-2.5">
        <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
        <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
          {String(count).padStart(2, "0")} records
        </span>
      </div>
      <div className="grid grid-cols-1 gap-px border border-t-0 border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
