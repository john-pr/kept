import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
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
  description: "A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMonoSans.variable} ${jetbrainsMonoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <EditorPreferencesProvider>
          <ItemDrawerProvider>{children}</ItemDrawerProvider>
        </EditorPreferencesProvider>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}
