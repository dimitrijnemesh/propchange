import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700"], variable: "--font-grotesk", display: "swap" });

// The landing's own address (used for the social preview image links). On Vercel it is detected automatically;
// set NEXT_PUBLIC_SITE_URL when you add a custom domain.
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3300");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "PropChange — Take a Seat. Copy. Earn.",
  description:
    "The first Seat Market. Verified traders sell a limited number of Seats in their strategies; you copy in your own account and get refunded if they break the rules. Join the waitlist.",
  openGraph: {
    title: "PropChange — the first Seat Market",
    description: "Take a Seat in a verified trader's strategy. Copy with protection. Join the waitlist.",
    type: "website",
  },
  twitter: { card: "summary_large_image", site: "@propchange_io" },
};

export const viewport: Viewport = { themeColor: "#0A0A0C", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${grotesk.variable}`} suppressHydrationWarning>
      <head>
        {/* Skip the intro for reduced motion before first paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("intro-done")}catch(e){}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
