import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/db/users";
import { UpgradePlans } from "@/components/upgrade/UpgradePlans";

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (user.isPro) {
    redirect("/settings");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 lg:px-8">
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Upgrade to Pro
      </h1>
      <p className="mb-8 text-muted-foreground">
        Unlock unlimited items, unlimited collections, and file uploads.
      </p>

      <UpgradePlans />
    </div>
  );
}
