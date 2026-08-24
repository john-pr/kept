import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { CheckEmailContent } from "@/components/auth/CheckEmailContent";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard
        title="Check your email"
        description="We sent a verification link to your email address. Click it to activate your account."
      >
        <Suspense>
          <CheckEmailContent />
        </Suspense>
      </AuthCard>
    </div>
  );
}
