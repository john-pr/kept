"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackToSignInLink } from "@/components/auth/BackToSignInLink";
import { toast } from "@/lib/toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("auth");
  const tc = useTranslations("common");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordSchema = z
    .object({
      password: z.string().min(8, t("errors.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.passwordsNoMatch"),
      path: ["confirmPassword"],
    });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(t("resetPassword.invalidRequestNew"));
      return;
    }

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tc("invalidInput"));
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, ...parsed.data }),
    });
    const result = await response.json();

    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? tc("somethingWentWrong"));
      return;
    }

    toast.success(t("resetPassword.successToast"), {
      description: t("resetPassword.successToastDescription"),
    });
    router.push("/sign-in");
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="destructive">
          <AlertDescription>{t("resetPassword.invalidMissingToken")}</AlertDescription>
        </Alert>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/forgot-password" className="text-foreground underline underline-offset-4">
            {t("resetPassword.requestNewLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">{t("resetPassword.confirmNewPassword")}</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {t("resetPassword.submit")}
        </Button>
      </form>
      <BackToSignInLink />
    </div>
  );
}
