import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <div className="flex flex-1 items-center justify-center p-4 pt-24">
        <AuthCard
          title="Sign in to DevStash"
          description="Enter your email and password to continue"
          contentClassName="flex flex-col gap-4"
        >
          <Suspense>
            <SignInForm />
          </Suspense>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-foreground underline underline-offset-4">
              Register
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
