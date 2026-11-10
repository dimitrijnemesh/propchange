import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/layout/logo";

export const metadata: Metadata = { title: "Log in" };

export default function Page() {
  return (
    <>
      <Logo className="mb-8" />
      <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 shadow-sm md:p-8">
        <h1 className="text-h2">Welcome back</h1>
        <p className="mb-6 mt-1 text-secondary">Log in to manage your Seats and strategies.</p>
        <AuthForm mode="login" />
      </div>
    </>
  );
}
