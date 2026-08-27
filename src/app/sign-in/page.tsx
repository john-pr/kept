import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink";
import { SignInForm } from "@/components/auth/SignInForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default async function SignInPage() {
  const t = await getTranslations("auth.signIn");

  return (
    <div className="relative min-h-screen">
      <HomeNav />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4">
        <AuthCard
          title={t("title")}
          description={t("description")}
          contentClassName="flex flex-col gap-[22px]"
          crumb={t("crumb")}
        >
          <Suspense>
            <SignInForm />
          </Suspense>
          <AuthSwitchLink prompt={t("noAccount")} href="/register" label={t("registerLink")} />
        </AuthCard>
      </div>
    </div>
  );
}
