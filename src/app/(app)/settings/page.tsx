import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { EditorPreferencesSection } from "@/components/settings/EditorPreferencesSection";
import { getCurrentUser } from "@/lib/db/users";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
          <CardDescription>
            Customize how the code editor looks and behaves. Changes save automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditorPreferencesSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            {user.hasPassword
              ? "Update the password used to sign in."
              : "You sign in with GitHub, so there's no password to manage."}
          </CardDescription>
        </CardHeader>
        {user.hasPassword && (
          <CardContent>
            <ChangePasswordSection />
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all of your items and collections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
