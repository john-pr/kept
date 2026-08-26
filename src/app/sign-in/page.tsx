import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen">
      <HomeNav />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
        <AuthCard
          title="Sign in"
          description="Enter your email and password to continue."
          contentClassName="flex flex-col gap-[22px]"
          crumb="Sign in"
        >
          <Suspense>
            <SignInForm />
          </Suspense>
          <p className="flex items-center justify-center gap-2 border-t border-dotted border-border pt-4 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            No account yet?
            <Link href="/register" className="text-primary underline underline-offset-4">
              Register
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
