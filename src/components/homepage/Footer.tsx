import { getTranslations } from "next-intl/server";
import { Logo } from "./Logo";

export async function Footer() {
  const t = await getTranslations("home.footer");

  const columns = [
    {
      heading: t("product"),
      links: [
        { label: t("features"), href: "#features" },
        { label: t("pricing"), href: "#pricing" },
      ],
    },
    {
      heading: t("company"),
      links: [
        { label: t("about"), href: null },
        { label: t("contact"), href: null },
      ],
    },
    {
      heading: t("legal"),
      links: [
        { label: t("privacy"), href: null },
        { label: t("terms"), href: null },
      ],
    },
  ];

  return (
    <footer className="border-t border-border px-6 pt-14">
      <div className="mx-auto flex max-w-5xl flex-wrap justify-between gap-10 pb-10">
        <div>
          <Logo />
          <p className="mt-2.5 max-w-56 text-sm text-muted-foreground">
            {t("tagline")}
          </p>
        </div>
        <div className="flex flex-wrap gap-14">
          {columns.map((col) => (
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
                    title={t("comingSoon")}
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
          {t("rights", { year: String(new Date().getFullYear()) })}
        </p>
      </div>
    </footer>
  );
}
