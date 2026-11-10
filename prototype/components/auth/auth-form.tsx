"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useApp } from "@/components/layout/providers";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { cn, sleep } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { CountryCodePicker } from "./country-code-picker";
import { AppleMark, CoinbaseMark, GoogleMark, MetaMaskMark, PhantomMark, WalletConnectMark } from "./provider-icons";

const schema = z.object({
  email: z.string().min(1, "Enter your email or phone").refine((v) => /\S+@\S+\.\S+/.test(v) || /^[\d\s-]{6,14}$/.test(v.trim()), "Enter a valid email or phone number"),
  password: z.string().min(1, "Enter a password"),
});
type Values = z.infer<typeof schema>;

type Provider = { key: string; label: string; icon: React.ElementType; wallet?: boolean };

const PRIMARY: Provider[] = [
  { key: "google", label: "Google", icon: GoogleMark },
  { key: "apple", label: "Apple", icon: AppleMark },
];
const WALLETS: Provider[] = [
  { key: "metamask", label: "MetaMask", icon: MetaMaskMark, wallet: true },
  { key: "phantom", label: "Phantom", icon: PhantomMark, wallet: true },
  { key: "walletconnect", label: "WalletConnect", icon: WalletConnectMark, wallet: true },
  { key: "coinbase", label: "Coinbase", icon: CoinbaseMark, wallet: true },
];

/** Binance-style sign-in: social, wallets, passkey and email/phone. */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const app = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [via, setVia] = useState<"email" | "phone">("email");
  const [country, setCountry] = useState(COUNTRIES[0]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const finish = async (p: { key: string; wallet?: boolean }) => {
    setBusy(p.key);
    await sleep(700);
    if (p.wallet) await app.connectWallet();
    app.logIn();
    router.push(mode === "signup" ? "/onboarding" : "/app");
  };

  const tile = (p: Provider) => (
    <button
      key={p.key}
      type="button"
      onClick={() => finish(p)}
      disabled={!!busy}
      aria-label={`Continue with ${p.label}`}
      className={cn(
        "inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface text-[13.5px] font-semibold transition-colors hover:border-border-strong hover:bg-bg-subtle disabled:opacity-60",
        "h-11 px-2",
      )}
    >
      {busy === p.key ? <Loader2 className="size-5 animate-spin text-tertiary" /> : <p.icon className="size-5" />}
      <span className="truncate">{p.label}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2">{PRIMARY.map((p) => tile(p))}</div>

      <div>
        <div className="mb-2 text-[12px] font-medium text-tertiary">Wallets</div>
        <div className="grid grid-cols-2 gap-2">{WALLETS.map((p) => tile(p))}</div>
      </div>

      <div className="flex items-center gap-3 text-caption text-tertiary">
        <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-bg-muted p-1" role="tablist" aria-label="Sign-in method">
        {(["email", "phone"] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={via === k}
            onClick={() => setVia(k)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-[13px] font-semibold transition-colors",
              via === k ? "bg-surface text-text shadow-sm" : "text-tertiary hover:text-text",
            )}
          >
            {k === "email" ? <Mail className="size-3.5" /> : <Smartphone className="size-3.5" />}
            {k === "email" ? "Email" : "Phone"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(() => finish({ key: "form" }))} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">{via === "email" ? "Email" : "Phone number"}</Label>
          <div className="flex gap-2">
            {via === "phone" ? <CountryCodePicker value={country} onChange={setCountry} /> : null}
            <Input
              id="email"
              type={via === "email" ? "email" : "tel"}
              inputMode={via === "email" ? "email" : "numeric"}
              autoComplete={via === "email" ? "email" : "tel-national"}
              placeholder={via === "email" ? "you@example.com" : "00 000 0000"}
              invalid={!!errors.email}
              className="min-w-0 flex-1"
              {...register("email")}
            />
          </div>
          <FieldError>{errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "login" ? (
              <a href="#" className="mb-1.5 text-caption font-semibold text-primary-text hover:underline">
                Forgot?
              </a>
            ) : null}
          </div>
          <Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} invalid={!!errors.password} {...register("password")} />
          <FieldError>{errors.password?.message}</FieldError>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy === "form"} disabled={!!busy}>
          {mode === "login" ? "Log in" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-secondary">
        {mode === "login" ? (
          <>
            New to PropChange?{" "}
            <Link href="/signup" className="font-semibold text-primary-text hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-text hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
      <p className="text-center text-[12px] text-tertiary">
        By continuing you agree to the{" "}
        <Link href="/legal/terms" className="underline hover:text-text">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline hover:text-text">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
