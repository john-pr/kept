import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackToSignInLink() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </p>
  );
}
