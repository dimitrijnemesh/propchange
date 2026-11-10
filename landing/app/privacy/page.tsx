import type { Metadata } from "next";
import { PrivacyContent } from "@/components/privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy — PropChange",
  description: "What PropChange collects when you join the waitlist or send feedback, why, and your rights.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
