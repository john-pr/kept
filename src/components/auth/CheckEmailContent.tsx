"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResendCooldown } from "@/hooks/useResendCooldown";

export function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { secondsLeft, startCooldown } = useResendCooldown();

  async function handleResend() {
    if (!email) return;
    setIsSubmitting(true);

    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setIsSubmitting(false);
    startCooldown();
    toast.success("Verification email sent", {
      description: `Check ${email} for the link.`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {email && <p className="text-sm text-muted-foreground">Sent to {email}</p>}
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting || !email || secondsLeft > 0}
        onClick={handleResend}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {secondsLeft > 0 ? `Resend verification email (${secondsLeft}s)` : "Resend verification email"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="text-foreground underline underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}