import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-[1.05rem] font-bold tracking-tight">
      <span className="grid size-5 grid-cols-2 gap-0.5">
        <span className="rounded-[2px] bg-[#3b82f6]" />
        <span className="rounded-[2px] bg-[#8b5cf6]" />
        <span className="rounded-[2px] bg-[#fde047]" />
        <span className="rounded-[2px] bg-[#ec4899]" />
      </span>
      Kept
    </Link>
  );
}
