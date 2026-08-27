import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink";
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
          <AuthSwitchLink prompt="No account yet?" href="/register" label="Register" />
        </AuthCard>
      </div>
    </div>
  );
}
