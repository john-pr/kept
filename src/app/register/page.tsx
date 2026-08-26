import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <div className="flex flex-1 flex-col items-center gap-4 p-4 pt-24">
        <AuthCard
          title="Create account"
          description="Get started with Kept — one place for links, snippets and commands."
          contentClassName="flex flex-col gap-[22px]"
          crumb="Access / Register"
          stepLabel="4 fields"
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
