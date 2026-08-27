import Link from "next/link";

const SIZE_CLASSES = {
  default: { icon: 20, text: "text-[1.05rem]" },
  lg: { icon: 26, text: "text-[1.3rem]" },
} as const;

interface LogoProps {
  size?: keyof typeof SIZE_CLASSES;
  /** Collapse the "Kept" wordmark to the icon alone below `sm` (kept in the
   * accessible name via `sr-only`). Used by the marketing nav on phones. */
  hideWordmarkOnMobile?: boolean;
}

export function Logo({ size = "default", hideWordmarkOnMobile = false }: LogoProps) {
  const { icon, text } = SIZE_CLASSES[size];

  return (
    <Link href="/" className={`flex items-center gap-2 ${text} font-bold tracking-tight`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="miter"
        className="text-primary"
        aria-hidden="true"
      >
        <polygon points="4.5,2.5 19.5,2.5 19.5,21.5 12,16.6 4.5,21.5"></polygon>
        <polyline points="8.6,10.4 11.4,13.2 16,7.2"></polyline>
      </svg>
      <span className={hideWordmarkOnMobile ? "sr-only sm:not-sr-only" : undefined}>
        Kept
      </span>
    </Link>
  );
}
