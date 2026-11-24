"use client";
import { ThemeProvider } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";

/** Mock session state (prototype only — no real auth, wallet or keys). */
interface AppState {
  loggedIn: boolean;
  /** True once the session cookie has been read on the client (avoids acting on the initial "logged out" default). */
  authReady: boolean;
  walletConnected: boolean;
  /** Connected wallet's public key (real Phantom address when available, demo address otherwise). */
  walletAddress: string;
  /** True when the address came from a real Phantom wallet. */
  walletReal: boolean;
  redUp: boolean;
  logIn: () => void;
  logOut: () => void;
  /** Resolves to the connected address, or null if the user rejected the Phantom popup. */
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  setRedUp: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};

const readCookie = (k: string) =>
  typeof document === "undefined" ? undefined : document.cookie.split("; ").find((c) => c.startsWith(k + "="))?.split("=")[1];
const writeCookie = (k: string, v: string | null) => {
  document.cookie = v === null ? `${k}=; path=/; max-age=0` : `${k}=${v}; path=/; max-age=31536000; samesite=lax`;
};

export const DEMO_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJo9fQa";

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
}
/** Phantom's injected Solana provider, if the extension is installed. */
export const getPhantom = (): PhantomProvider | undefined => {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { phantom?: { solana?: PhantomProvider }; solana?: PhantomProvider };
  const p = w.phantom?.solana ?? w.solana;
  return p?.isPhantom ? p : undefined;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [walletConnected, setWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState(DEMO_WALLET);
  const [walletReal, setWalletReal] = useState(false);
  const [redUp, setRedUpState] = useState(false);

  useEffect(() => {
    const authed = readCookie("pc_auth") === "1";
    setLoggedIn(authed);
    setAuthReady(true);
    // a wallet only counts as connected inside a signed-in session
    const hadWallet = authed && readCookie("pc_wallet") === "1";
    if (!authed) writeCookie("pc_wallet", null);
    setWallet(hadWallet);
    // silently restore a previously approved Phantom connection
    const ph = getPhantom();
    if (hadWallet && ph)
      ph.connect({ onlyIfTrusted: true })
        .then((r) => {
          setWalletAddress(r.publicKey.toString());
          setWalletReal(true);
        })
        .catch(() => {});
    const ru = readCookie("pc_updown") === "red-up";
    setRedUpState(ru);
    if (ru) document.documentElement.dataset.updown = "red-up";
  }, []);

  const logIn = useCallback(() => {
    writeCookie("pc_auth", "1");
    setLoggedIn(true);
  }, []);
  const logOut = useCallback(() => {
    writeCookie("pc_auth", null);
    writeCookie("pc_wallet", null);
    setLoggedIn(false);
    setWallet(false);
    getPhantom()?.disconnect().catch(() => {});
  }, []);
  const connectWallet = useCallback(async () => {
    const ph = getPhantom();
    let address = DEMO_WALLET;
    if (ph) {
      // real Phantom popup
      try {
        address = (await ph.connect()).publicKey.toString();
      } catch {
        return null; // user rejected
      }
      setWalletReal(true);
    } else {
      // no Phantom installed: fall back to the demo wallet so the flow can still be shown
      await new Promise((r) => setTimeout(r, 900));
      setWalletReal(false);
    }
    setWalletAddress(address);
    writeCookie("pc_wallet", "1");
    setWallet(true);
    return address;
  }, []);
  const disconnectWallet = useCallback(() => {
    writeCookie("pc_wallet", null);
    setWallet(false);
    setWalletReal(false);
    setWalletAddress(DEMO_WALLET);
    getPhantom()?.disconnect().catch(() => {});
  }, []);
  const setRedUp = useCallback((v: boolean) => {
    setRedUpState(v);
    writeCookie("pc_updown", v ? "red-up" : null);
    if (v) document.documentElement.dataset.updown = "red-up";
    else delete document.documentElement.dataset.updown;
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <ToastProvider>
          <Ctx.Provider
            value={{
              loggedIn,
              authReady,
              walletConnected,
              walletAddress,
              walletReal,
              redUp,
              logIn,
              logOut,
              connectWallet,
              disconnectWallet,
              setRedUp,
            }}
          >
            {children}
          </Ctx.Provider>
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

/** "7xKX…9fQa" */
export const shortAddress = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

/**
 * Account area guard: signed-out visitors are sent to /login and come back here after signing in.
 * Children are hidden until the session is known, so private data never flashes.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { loggedIn, authReady } = useApp();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => {
    if (authReady && !loggedIn) router.replace(`/login?next=${encodeURIComponent(path)}`);
  }, [authReady, loggedIn, path, router]);
  if (!authReady || !loggedIn) return null;
  return <>{children}</>;
}
