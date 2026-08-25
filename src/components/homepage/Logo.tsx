import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[1.05rem] font-bold tracking-tight">
      <span className="grid size-5 grid-cols-2 gap-0.5">
        <span className="rounded-none bg-[#3b82f6]" />
        <span className="rounded-none bg-[#8b5cf6]" />
        <span className="rounded-none bg-[#fde047]" />
        <span className="rounded-none bg-[#ec4899]" />
      </span>
      Kept
    </Link>
  );
}
