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
  // Demo "today" is frozen at build/start time and inlined for server and client alike,
  // so mock dates stay fresh without hydration mismatches.
  env: { NEXT_PUBLIC_DEMO_TODAY: new Date().toISOString().slice(0, 10) },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
