import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { EditorPreferencesProvider } from "@/components/editor/EditorPreferencesProvider";
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

export const metadata: Metadata = {
  title: "Kept",
  description: "Snippets, prompts, commands, notes, links, files, and images — kept in one fast, searchable, AI-enhanced hub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMonoSans.variable} ${jetbrainsMonoMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <EditorPreferencesProvider>
            <ItemDrawerProvider>{children}</ItemDrawerProvider>
          </EditorPreferencesProvider>

          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
