import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your Seats and strategies.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
