/**
 * Extensible locale registry.
 * English is the primary (source) language. BG and future locales are translations.
 * To add a language: create dictionaries/<code>.ts implementing Dictionary, then register below.
 */
export const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "bg", label: "Български", short: "BG" },
  // Future: { code: "de", label: "Deutsch", short: "DE" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_COOKIE = "evtinko_locale";

export function isLocale(value: string | null | undefined): value is LocaleCode {
  return !!value && LOCALES.some((l) => l.code === value);
}
