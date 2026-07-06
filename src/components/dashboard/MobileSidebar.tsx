"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { UserFooter } from "@/components/dashboard/UserFooter";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Open sidebar" />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetHeader className="flex-row items-center border-b border-border px-2 py-3">
          <SheetTitle className="text-xs font-medium tracking-wide text-muted-foreground">
            Navigation
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <SidebarNav />
        </div>
        <UserFooter />
      </SheetContent>
    </Sheet>
  );
}