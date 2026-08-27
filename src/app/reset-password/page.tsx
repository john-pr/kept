import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage() {
  const t = await getTranslations("auth.resetPassword");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title={t("title")} description={t("description")}>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </AuthCard>
    </div>
  );
}
