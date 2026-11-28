import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return (
    <AuthShell title="Create your account" subtitle="Copy strategies with a Seat Contract, or publish your own.">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
