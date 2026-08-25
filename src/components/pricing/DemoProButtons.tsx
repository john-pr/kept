"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { activateDemoPro, deactivateDemoPro } from "@/actions/billing";

interface DemoProButtonProps {
  className?: string;
}

/**
 * Portfolio-only bypass buttons for the Pro gate — see `src/actions/billing.ts`.
 * Shown alongside the real Stripe test-mode Checkout/portal flow, not in place of it.
 */
export function ActivateDemoProButton({ className }: DemoProButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const result = await activateDemoPro();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    toast.success("Demo Pro activated — no payment needed.");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className={className} disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      Try Pro instantly (demo, no payment)
    </Button>
  );
}

export function DeactivateDemoProButton({ className }: DemoProButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const result = await deactivateDemoPro();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    toast.success("Reverted to Free.");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className={className} disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      Revert to Free (demo)
    </Button>
  );
}
