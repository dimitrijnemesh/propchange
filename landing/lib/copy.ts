import { de } from "./i18n/de";
import { es } from "./i18n/es";
import { fr } from "./i18n/fr";
import { hi } from "./i18n/hi";
import { it } from "./i18n/it";
import { ja } from "./i18n/ja";
import { ko } from "./i18n/ko";
import { pl } from "./i18n/pl";
import { pt } from "./i18n/pt";
import { tr } from "./i18n/tr";
import { uk } from "./i18n/uk";
import { zh } from "./i18n/zh";

export const LANGS = [
  { code: "en", label: "English", short: "EN" },
  { code: "uk", label: "Українська", short: "UA" },
  { code: "es", label: "Español", short: "ES" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "it", label: "Italiano", short: "IT" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "tr", label: "Türkçe", short: "TR" },
  { code: "zh", label: "中文", short: "中文" },
  { code: "ja", label: "日本語", short: "日本" },
  { code: "ko", label: "한국어", short: "한국" },
  { code: "hi", label: "हिन्दी", short: "हि" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.code === v);

/** Link to the working prototype (demo data). */
export const PROTOTYPE_URL = process.env.NEXT_PUBLIC_PROTOTYPE_URL || "https://propchange.vercel.app";

export const en = {
  nav: { how: "How it works", why: "Why Seats", faq: "FAQ", join: "Join waitlist", proto: "Try prototype", feedback: "Feedback", language: "Language" },
  hero: {
    eyebrow: "The first Seat Market",
    title1: "Take a Seat.",
    title2: "Copy. Earn.",
    sub: "Verified traders sell a limited number of Seats in their strategies. Take a Seat, copy the trader in your own exchange account — and get refunded if they break the rules.",
    note: "Early access invites go out in waves. No spam.",
    proto: "Or try the prototype →",
  },
  form: {
    placeholder: "Your email",
    button: "Join the waitlist",
    sending: "Joining…",
    roleLabel: "I want to",
    roles: { follower: "Copy traders", trader: "List my strategy", community: "Partner (community)" },
    more: "Add X and phone (optional)",
    less: "Hide optional fields",
    x: "X (Twitter) username",
    xPh: "@username",
    phone: "Phone",
    phonePh: "+380 67 123 4567",
    optional: "optional",
    ok: "You're on the list. We'll email you when early access opens.",
    dup: "You're already on the list — we'll be in touch.",
    errEmail: "Please enter a valid email.",
    errX: "X username can only have letters, numbers and _ (up to 15).",
    errPhone: "Please enter a valid phone number with the country code.",
    errRate: "Too many attempts. Try again in a minute.",
    err: "Something went wrong. Please try again.",
    didYouMean: "Did you mean",
    errDisposable: "Please use a permanent email, not a temporary one.",
    errDomain: "This email domain can't receive mail. Check for a typo.",
    errSlow: "Too fast — please wait a second and try again.",
    errCheck: "Couldn't confirm you're human. Please try again.",
    consent: "By joining, you agree to our {link}.",
  },
  concept: {
    trader: "Verified trader",
    token: "Seat",
    seats: "Limited Seats",
    users: "Users copy",
    kept: "Rules kept → trader earns",
    broken: "Rules broken → users refunded",
    tokenized: "Tokenized",
    buy: "Take a Seat",
  },
  problem: {
    eyebrow: "The problem",
    title: "Trading is a profession. Copy trading became a gamble.",
    stat: "97%",
    statText: "of day traders lose money over the long run.",
    statSrc: "Chague, De-Losso & Giovannetti, 2019",
    items: [
      ["Fake track records", "Traders show only their winning accounts."],
      ["Exit liquidity", "Followers pump coins the trader sells into."],
      ["No limits", "Thousands copy one trader and the edge disappears."],
      ["No safeguards", "Nothing stops a trader from breaking their own rules."],
      ["Zero control", "Followers can only deposit or withdraw."],
    ],
  },
  how: {
    eyebrow: "How it works",
    title: "A new market where traders become assets",
    steps: [
      ["Pick a verified trader", "Real results straight from the exchange, with pro analytics."],
      ["Take a Seat", "Every trader has limited Seats. When full, bid on the Seatlist."],
      ["Copy with protection", "Trades copy into your own account. The Risk Engine watches every trade."],
      ["Settle the Epoch", "Rules kept — the trader is paid. Rules broken — you're refunded."],
    ],
  },
  why: {
    eyebrow: "Why Seats",
    title: "Everything copy trading was missing",
    items: [
      ["Limited capacity", "A fixed number of Seats per trader. No crowding, no late entries."],
      ["Seat Contract", "Risk rules generated from the trader's own history."],
      ["Risk Engine", "Enforces the contract — plus your own personal limits."],
      ["Verified data", "Results pulled from the exchange. No screenshots."],
      ["Seatlist", "Full trader? Bid. Free Seats go instantly to the highest bids."],
      ["Liquid markets only", "Crypto majors, FX and commodities. No meme coins."],
    ],
  },
  winwin: {
    eyebrow: "Win-win",
    title: "Traders earn. You trade with zero skills.",
    users: ["For users", "Access to professional traders, copied in your own account, with rules and refunds built in."],
    traders: ["For traders", "An additional, consistent income — paid for discipline, not for hype."],
  },
  proto: {
    eyebrow: "Try it now",
    title: "Click through the prototype",
    text: "Explore the working prototype: Seats, analytics, Seat Contracts, the Seat Market and the trader dashboard. It runs on demo data — no real money.",
    open: "Open the prototype",
    give: "Give feedback",
  },
  soon: {
    eyebrow: "Coming next",
    title: "The Seat Market on Solana",
    text: "Seats become tokens you can hold, resell and bid on — a real market for trading talent. Join the waitlist to be first when it opens.",
  },
  feedback: {
    eyebrow: "Feedback",
    title: "Tell us what you think",
    sub: "Tried the prototype or just read the idea? Every answer goes straight to the founder.",
    rating: "How useful would PropChange be for you?",
    ratingLow: "Not useful",
    ratingHigh: "Very useful",
    liked: "What did you like?",
    improve: "What should we improve or add?",
    email: "Email, if you want a reply",
    button: "Send feedback",
    sending: "Sending…",
    ok: "Thank you! Your feedback reached the team.",
    errEmpty: "Please choose a rating or write a few words.",
    err: "Something went wrong. Please try again.",
    errSlow: "Too fast — please wait a second and try again.",
    errCheck: "Couldn't confirm you're human. Please try again.",
    consent: "By sending, you agree to our {link}.",
  },
  faq: {
    title: "FAQ",
    items: [
      ["What is a Seat?", "The right to copy one trader's strategy for one Epoch (a fixed period), up to a set amount. Each trader has a limited number of Seats."],
      ["Do you hold my money?", "No. You copy in your own exchange account with an API key that cannot withdraw. Your capital never leaves your account."],
      ["What happens if the trader breaks the rules?", "The Risk Engine stops copying immediately and you get your Seat payment back. Refunds cover the Seat price, not trading losses."],
      ["What if all Seats are taken?", "Place a bid on the Seatlist. When Seats expire, they go instantly to the highest bids, and we notify you if someone outbids you."],
      ["I'm a trader. Can I list my strategy?", "Yes — choose 'List my strategy' when you join. We'll invite verified traders first."],
    ],
  },
  final: { title: "Be first to take a Seat", sub: "Join the waitlist for early access." },
  footer: {
    disclaimer: "PropChange is in development. Nothing on this site is financial advice or an offer of any financial product. Trading involves risk; past performance does not guarantee future results.",
    rights: "All rights reserved.",
    privacy: "Privacy Policy",
    privacyTitle: "Privacy Policy",
  },
};

export type Copy = typeof en;

export const copy: Record<Lang, Copy> = { en, uk, es, pt, fr, de, it, pl, tr, zh, ja, ko, hi };
