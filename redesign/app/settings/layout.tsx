import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";

/** Private area: keep out of search results. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell role="settings">{children}</AppShell>;
}
