import { Package, FolderOpen, Heart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats } from "@/lib/dashboard";

const stats = [
  { label: "Total Items", value: dashboardStats.totalItems, icon: Package },
  { label: "Collections", value: dashboardStats.totalCollections, icon: FolderOpen },
  { label: "Favorite Items", value: dashboardStats.favoriteItems, icon: Heart },
  { label: "Favorite Collections", value: dashboardStats.favoriteCollections, icon: Star },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}