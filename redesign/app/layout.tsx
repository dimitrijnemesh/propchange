import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { EditionProvider } from "@/components/layout/edition-provider";
import { Providers } from "@/components/layout/providers";
import { getEdition } from "@/lib/edition-server";
import { I18nProvider } from "@/components/layout/i18n-provider";
import { MESSAGES } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["500"], variable: "--font-grotesk", display: "swap" });

const DESCRIPTION =
  "Copy professional trading strategies with a Seat Contract. If the trader breaks it, your fee comes back. Non-custodial strategy market.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PropChange — Take a Seat. Copy. Earn.", template: "%s — PropChange" },
  description: DESCRIPTION,
  applicationName: "PropChange",
  keywords: ["copy trading", "trading strategies", "seat contract", "non-custodial", "seat market", "USDC"],
  openGraph: {
    type: "website",
    siteName: "PropChange",
    title: "PropChange — Take a Seat. Copy. Earn.",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: { card: "summary_large_image", site: "@propchange_io", creator: "@propchange_io", title: "PropChange — Take a Seat. Copy. Earn.", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0C" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, edition] = await Promise.all([getLocale(), getEdition()]);
  return (
    <html lang={locale} suppressHydrationWarning className={`intro-done ${inter.variable} ${mono.variable} ${grotesk.variable}`}>
      <body className="min-h-dvh font-sans">
        <I18nProvider locale={locale} messages={MESSAGES[locale]}>
          <EditionProvider edition={edition}>
            <Providers>{children}</Providers>
          </EditionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
