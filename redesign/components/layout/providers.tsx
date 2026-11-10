"use client";
import { ThemeProvider } from "next-themes";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ToastProvider } from "@/components/ui/toast";

/** Mock session state (prototype only — no real auth, wallet or keys). */
interface AppState {
  loggedIn: boolean;
  walletConnected: boolean;
  redUp: boolean;
  logIn: () => void;
  logOut: () => void;
  connectWallet: () => Promise<void>;
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

export function Providers({ children }: { children: React.ReactNode }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [walletConnected, setWallet] = useState(false);
  const [redUp, setRedUpState] = useState(false);

  useEffect(() => {
    setLoggedIn(readCookie("pc_auth") === "1");
    setWallet(readCookie("pc_wallet") === "1");
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
  }, []);
  const connectWallet = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 1100));
    writeCookie("pc_wallet", "1");
    setWallet(true);
  }, []);
  const disconnectWallet = useCallback(() => {
    writeCookie("pc_wallet", null);
    setWallet(false);
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
              walletConnected,
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

/** Marks the user as logged in when they enter the app area (any input logs in to the demo user). */
export function EnsureLoggedIn() {
  const { loggedIn, logIn } = useApp();
  useEffect(() => {
    if (!loggedIn && readCookie("pc_auth") !== "1") logIn();
  }, [loggedIn, logIn]);
  return null;
}
