import Link from "next/link";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <div className="flex flex-1 flex-col items-center gap-4 p-4 pt-24">
        <AuthCard
          title="Sign in"
          description="Enter your email and password to continue."
          contentClassName="flex flex-col gap-[22px]"
          crumb="Access / Sign in"
          stepLabel="2 fields"
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
