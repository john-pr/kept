import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title="Reset your password" description="Choose a new password for your account">
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
