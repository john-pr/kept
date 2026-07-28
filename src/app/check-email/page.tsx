import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckEmailContent } from "@/components/auth/CheckEmailContent";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to your email address. Click it to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <CheckEmailContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}