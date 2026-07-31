"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResendCooldown } from "@/hooks/useResendCooldown";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

async function sendResetLink(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { secondsLeft, startCooldown } = useResendCooldown();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    const result = await sendResetLink(parsed.data.email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    setIsSubmitted(true);
    startCooldown();
  }

  async function handleResend() {
    setIsResending(true);
    const result = await sendResetLink(email);
    setIsResending(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    startCooldown();
    toast.success("Reset link sent", {
      description: `Check ${email} for the link.`,
    });
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <CheckCircle2 className="size-8 text-emerald-500" />
          <p className="font-medium text-foreground">Reset link sent</p>
          <p className="text-sm text-muted-foreground">
            If an account exists for {email}, we&apos;ve sent a link to reset your password.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isResending || secondsLeft > 0}
          onClick={handleResend}
        >
          {isResending && <Loader2 className="size-4 animate-spin" />}
          {secondsLeft > 0 ? `Resend reset link (${secondsLeft}s)` : "Resend reset link"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}