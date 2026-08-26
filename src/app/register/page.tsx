import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
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
          <p className="flex items-center justify-center gap-2 border-t border-dotted border-border pt-4 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
            Already registered?
            <Link href="/sign-in" className="text-primary underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}
