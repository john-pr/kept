"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, CircleXIcon, Loader2Icon } from "lucide-react"
import { useIsMobile } from "@/hooks/useIsMobile"

const Toaster = ({ position, ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      // Desktop: top center, stacks downward (matches the mockup's "01 — Desktop"
      // spec). The 76px top offset clears the ~57px app TopBar (border + px-4 py-3 +
      // lg logo) so toasts don't land on the centered search field — see the
      // ui-reviewer finding. Mobile: bottom, above the tab bar, rises from the bottom
      // edge (the mockup's "02 — Mobile" spec) — MobileTabBar.tsx is a 56px sticky bar
      // plus its 1px top border, so the 76px bottom offset below clears it with room to spare.
      position={position ?? (isMobile ? "bottom-center" : "top-center")}
      offset={{ top: 76 }}
      mobileOffset={{ bottom: 76, left: 12, right: 12 }}
      gap={10}
      closeButton
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <CircleXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "420px",
        } as React.CSSProperties
      }
      toastOptions={{
        // Sonner's own `[data-styled=true]`-gated CSS is turned off here so the
        // "Ledger" skin in globals.css (`.cn-toast[data-sonner-toast]` and friends)
        // fully owns the visuals with no specificity fight — see the comment there.
        unstyled: true,
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
