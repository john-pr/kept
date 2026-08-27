"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BackToSignInLink } from "@/components/auth/BackToSignInLink";
import { useResendCooldown } from "@/hooks/useResendCooldown";

async function sendResetLink(email: string) {
  const response = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return response.json();
}

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tc = useTranslations("common");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { secondsLeft, startCooldown } = useResendCooldown();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t("errors.validEmail")),
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tc("invalidInput"));
      return;
    }

    setIsSubmitting(true);
    const result = await sendResetLink(parsed.data.email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? tc("somethingWentWrong"));
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
      toast.error(result.error ?? tc("somethingWentWrong"));
      return;
    }

    startCooldown();
    toast.success(t("forgotPassword.resendToast"), {
      description: t("forgotPassword.resendToastDescription", { email }),
    });
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-2 py-2 text-center">
          <CheckCircle2 className="size-8 text-emerald-500" />
          <p className="font-medium text-foreground">{t("forgotPassword.sentHeading")}</p>
          <p className="text-sm text-muted-foreground">
            {t("forgotPassword.sentBody", { email })}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={isResending || secondsLeft > 0}
          onClick={handleResend}
        >
          {isResending && <Loader2 className="size-4 animate-spin" />}
          {secondsLeft > 0
            ? t("forgotPassword.resendCountdown", { seconds: secondsLeft })
            : t("forgotPassword.resend")}
        </Button>
        <BackToSignInLink />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">{t("fields.email")}</Label>
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
          {t("forgotPassword.submit")}
        </Button>
      </form>
      <BackToSignInLink />
    </div>
  );
}
