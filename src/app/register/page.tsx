import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { HomeNav } from "@/components/homepage/HomeNav";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeNav />
      <div className="flex flex-1 items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Get started with DevStash</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <RegisterForm />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-foreground underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}