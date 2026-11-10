import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Sign up" };

export default function Page() {
  return (
    <>
      <Logo className="mb-8" />
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <h1 className="text-h2">Create your account</h1>
        <p className="mb-6 mt-1 text-secondary">Copy strategies with a Seat Contract, or publish your own.</p>
        <AuthForm mode="signup" />
      </div>
    </>
  );
}
