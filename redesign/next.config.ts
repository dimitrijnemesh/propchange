import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR lets a production build run alongside `next dev` without clobbering it.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Pin the workspace root to this folder (the parent directory has its own lockfile).
  turbopack: { root: process.cwd() },
  poweredByHeader: false,
  // One main "Seats" page replaces Strategies + Seat Market; strategy pages live under /seats/[slug].
  async redirects() {
    return [
      { source: "/seats", destination: "/", permanent: false },
      { source: "/strategies/:slug", destination: "/seats/:slug", permanent: false },
      { source: "/strategies", missing: [{ type: "query", key: "view" }], destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
