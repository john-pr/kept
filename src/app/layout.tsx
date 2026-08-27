import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { EditorPreferencesProvider } from "@/components/editor/EditorPreferencesProvider";
import { ToastI18nProvider } from "@/components/i18n/ToastI18nProvider";
import "./globals.css";

// One monospace family drives both --font-sans (headings/body) and --font-mono (code),
// matching the "ledger" design system's single-typeface look.
const jetbrainsMonoSans = JetBrains_Mono({
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const jetbrainsMonoMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${jetbrainsMonoSans.variable} ${jetbrainsMonoMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <ToastI18nProvider />
            <EditorPreferencesProvider>
              <ItemDrawerProvider>{children}</ItemDrawerProvider>
            </EditorPreferencesProvider>

            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
