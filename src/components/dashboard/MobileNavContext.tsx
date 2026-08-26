"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface MobileNavContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

/**
 * Shares the mobile nav drawer's open state between `TopBar`'s hamburger button and
 * `MobileTabBar`'s "Items" tab, which both open the same drawer (rendered once, inside
 * `MobileSidebar`). Desktop's `Sidebar`/`SidebarNav` don't use this — they have no drawer.
 */
export function MobileNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return <MobileNavContext.Provider value={value}>{children}</MobileNavContext.Provider>;
}

export function useMobileNav() {
  const context = useContext(MobileNavContext);
  if (!context) {
    throw new Error("useMobileNav must be used within a MobileNavProvider");
  }
  return context;
}
