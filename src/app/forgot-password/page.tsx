import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title="Forgot your password?" description="Enter your email and we'll send you a reset link">
        <ForgotPasswordForm />
      </AuthCard>
    </div>
  );
}
