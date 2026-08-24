import type { ReactNode } from "react";

interface DashboardGridSectionProps {
  title: string;
  children: ReactNode;
}

/** Shared "titled grid" shape used by the dashboard's pinned/recent items and recent collections sections. */
export function DashboardGridSection({ title, children }: DashboardGridSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}
