import Link from "next/link";

interface AuthSwitchLinkProps {
  /** e.g. "No account yet?" / "Already registered?" */
  prompt: string;
  href: string;
  label: string;
}

/** The bottom-of-card link between `/sign-in` and `/register` (the ledger-styled
 * counterpart to `BackToSignInLink`, which the forgot/reset/check-email pages use). */
export function AuthSwitchLink({ prompt, href, label }: AuthSwitchLinkProps) {
  return (
    <p className="flex items-center justify-center gap-2 border-t border-dotted border-border pt-4 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
      {prompt}
      <Link href={href} className="text-primary underline underline-offset-4">
        {label}
      </Link>
    </p>
  );
}
