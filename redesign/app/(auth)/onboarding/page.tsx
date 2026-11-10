import type { Metadata } from "next";
import { Suspense } from "react";
import { Onboarding } from "@/components/auth/onboarding";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Get started", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <>
      <Logo className="mb-8" />
      <Suspense>
        <Onboarding />
      </Suspense>
    </>
  );
}
