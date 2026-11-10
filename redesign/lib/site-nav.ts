import type { MessageKey } from "@/lib/i18n/messages";

/** One site map shared by the burger menu, footer and info pages. */
export interface NavSection {
  title: MessageKey;
  /** shown in the burger menu only on mobile (already in the desktop navbar) */
  mobileOnly?: boolean;
  /** rendered as highlighted cards in the burger menu (the core product) */
  highlight?: boolean;
  links: { label: MessageKey; href: string }[];
}

export const SITE_NAV: NavSection[] = [
  {
    title: "menu.markets",
    highlight: true,
    links: [
      { label: "nav.seats", href: "/" },
      { label: "nav.mySeats", href: "/app/seats" },
    ],
  },
  {
    title: "menu.learn",
    links: [
      { label: "nav.howItWorks", href: "/how-it-works" },
      { label: "nav.fees", href: "/fees" },
      { label: "menu.faq", href: "/faq" },
      { label: "footer.glossary", href: "/glossary" },
    ],
  },
  {
    title: "menu.traders",
    links: [
      { label: "nav.leaderboard", href: "/strategies?sort=compliance&view=leaderboard" },
      { label: "footer.becomeTrader", href: "/signup?role=trader" },
      { label: "footer.riskContracts", href: "/how-it-works#contract" },
      { label: "footer.capacity", href: "/how-it-works#capacity" },
      { label: "menu.referral", href: "/app/referral" },
    ],
  },
  {
    title: "menu.support",
    links: [
      { label: "menu.help", href: "/support" },
      { label: "footer.status", href: "/status" },
      { label: "menu.contact", href: "/support#contact" },
    ],
  },
  {
    title: "menu.company",
    links: [
      { label: "footer.about", href: "/about" },
      { label: "menu.communityHub", href: "/community" },
      { label: "footer.terms", href: "/legal/terms" },
      { label: "footer.privacy", href: "/legal/privacy" },
      { label: "footer.riskDisclosure", href: "/legal/risk" },
    ],
  },
];

export type SocialKey = "x" | "instagram";

/** Official PropChange channels (real accounts — every icon links straight to them). */
export const SOCIALS: { key: SocialKey; name: string; handle: string; url: string; blurb: string }[] = [
  { key: "x", name: "X (Twitter)", handle: "@propchange_io", url: "https://x.com/propchange_io", blurb: "Product news, Epoch results and live breach alerts." },
  { key: "instagram", name: "Instagram", handle: "@propchange.io", url: "https://www.instagram.com/propchange.io", blurb: "Highlights, product previews and behind-the-scenes." },
];
