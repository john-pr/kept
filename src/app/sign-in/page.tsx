import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/SignInForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <div className="flex flex-1 items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Sign in to DevStash</CardTitle>
            <CardDescription>Enter your email and password to continue</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Suspense>
              <SignInForm />
            </Suspense>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-foreground underline underline-offset-4">
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}