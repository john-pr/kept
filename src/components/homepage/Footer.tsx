import { Logo } from "./Logo";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: null },
      { label: "Contact", href: null },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: null },
      { label: "Terms", href: null },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 pt-14">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-10 pb-10">
        <div>
          <Logo />
          <p className="mt-2.5 max-w-56 text-sm text-muted-foreground">
            Everything you meant to keep, in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-14">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-2.5">
              <h4 className="mb-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                {col.heading}
              </h4>
              {col.links.map((link) =>
                link.href ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ) : (
                  <span
                    key={link.label}
                    aria-disabled="true"
                    title="Coming soon"
                    className="text-sm text-muted-foreground/40"
                  >
                    {link.label}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-5xl border-t border-border py-5 text-center">
        <p className="text-[0.82rem] text-muted-foreground">
          &copy; {new Date().getFullYear()} Kept. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
