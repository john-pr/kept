import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen">
      <HomeNav />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
        <AuthCard
          title="Create account"
          description="Get started with Kept — one place for links, snippets and commands."
          contentClassName="flex flex-col gap-[22px]"
          crumb="Sign up"
        >
          <RegisterForm />
          <AuthSwitchLink prompt="Already registered?" href="/sign-in" label="Sign in" />
        </AuthCard>
      </div>
    </div>
  );
}
