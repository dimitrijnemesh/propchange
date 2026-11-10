"use client";
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/locales";
import { en, type MessageKey } from "@/lib/i18n/messages";

type Ctx = { locale: Locale; t: (key: MessageKey) => string };
const I18nCtx = createContext<Ctx>({ locale: "en", t: (k) => en[k] });

/** Receives only the active locale's messages from the server; falls back to English per key. */
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Partial<Record<MessageKey, string>>;
  children: React.ReactNode;
}) {
  const value = useMemo<Ctx>(() => ({ locale, t: (k) => messages[k] ?? en[k] }), [locale, messages]);
  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);
export const useT = () => useContext(I18nCtx).t;
