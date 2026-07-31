"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GitHubIcon } from "@/components/auth/GitHubIcon";
import { useResendCooldown } from "@/hooks/useResendCooldown";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { secondsLeft, startCooldown } = useResendCooldown();

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email verified", {
        description: "You can now sign in.",
      });
    } else if (searchParams.get("verifyError") === "expired-token") {
      toast.error("Verification link expired", {
        description: "Sign in and use the resend option to get a new link.",
      });
    } else if (searchParams.get("verifyError") === "missing-token") {
      toast.error("Invalid verification link");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsUnverified(false);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      if (result.code === "unverified-email") {
        setIsUnverified(true);
        setError("Please verify your email before signing in.");
      } else if (result.code === "rate-limited") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Invalid email or password");
      }
      return;
    }

    router.push(callbackUrl);
  }

  async function handleResend() {
    setIsResending(true);

    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();

    setIsResending(false);

    if (!result.success) {
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    startCooldown();
    toast.success("Verification email sent", {
      description: `Check ${email} for the link.`,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-2">
            {error}
            {isUnverified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isResending || secondsLeft > 0}
                onClick={handleResend}
              >
                {isResending && <Loader2 className="size-4 animate-spin" />}
                {secondsLeft > 0 ? `Resend verification email (${secondsLeft}s)` : "Resend verification email"}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

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
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-border" />
        <span className="px-3 text-xs text-muted-foreground">OR</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isGithubLoading}
        onClick={() => {
          setIsGithubLoading(true);
          signIn("github", { callbackUrl });
        }}
      >
        {isGithubLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <GitHubIcon className="size-4" />
        )}
        Sign in with GitHub
      </Button>
    </div>
  );
}