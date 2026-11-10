import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { strategies } from "@/mock/strategies";
import { traders } from "@/mock/traders";

const STATIC = ["", "/strategies", "/seats", "/how-it-works", "/fees", "/faq", "/glossary", "/about", "/community", "/support", "/status", "/legal/terms", "/legal/privacy", "/legal/risk", "/login", "/signup"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...STATIC.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.7 })),
    ...strategies
      .filter((s) => s.state !== "closed")
      .map((s) => ({ url: `${SITE_URL}/strategies/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
    ...strategies
      .filter((s) => s.state !== "closed")
      .map((s) => ({ url: `${SITE_URL}/seats/${s.slug}`, lastModified: now, changeFrequency: "hourly" as const, priority: 0.6 })),
    ...traders.map((t) => ({ url: `${SITE_URL}/traders/${t.handle}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
}
