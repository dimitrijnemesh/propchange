import type { Metadata } from "next";
import { SettingsPanel } from "@/components/app/settings-panel";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="max-w-[880px]">
      <PageHeader title="Settings" description="Profile, appearance, notifications and security." />
      <SettingsPanel />
    </div>
  );
}
