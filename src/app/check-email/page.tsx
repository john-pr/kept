import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { CheckEmailContent } from "@/components/auth/CheckEmailContent";

export default async function CheckEmailPage() {
  const t = await getTranslations("auth.checkEmail");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard title={t("title")} description={t("description")}>
        <Suspense>
          <CheckEmailContent />
        </Suspense>
      </AuthCard>
    </div>
  );
}
