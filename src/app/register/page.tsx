import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthSwitchLink } from "@/components/auth/AuthSwitchLink";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default async function RegisterPage() {
  const t = await getTranslations("auth.register");

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
          <RegisterForm />
          <AuthSwitchLink prompt={t("alreadyRegistered")} href="/sign-in" label={t("signInLink")} />
        </AuthCard>
      </div>
    </div>
  );
}
