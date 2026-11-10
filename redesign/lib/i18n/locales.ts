export const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "uk", label: "Українська", short: "UA" },
  { code: "es", label: "Español", short: "ES" },
  { code: "pt", label: "Português", short: "PT" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "it", label: "Italiano", short: "IT" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "tr", label: "Türkçe", short: "TR" },
  { code: "zh", label: "中文", short: "中文" },
  { code: "ja", label: "日本語", short: "日本" },
  { code: "ko", label: "한국어", short: "한국" },
  { code: "hi", label: "हिन्दी", short: "हि" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "pc_lang";
export const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.code === v);
