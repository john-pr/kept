import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { getCurrentUser } from "@/lib/db/users";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-lg p-4 py-12">
      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size="lg" />
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Plan: {user.isPro ? "Pro" : "Free"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}