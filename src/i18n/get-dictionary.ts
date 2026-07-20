import { DEFAULT_LOCALE, isLocale, type LocaleCode } from "./config";
import { en, type Dictionary } from "./dictionaries/en";
import { bg } from "./dictionaries/bg";

/** Register new language dictionaries here (client + server safe) */
const messages: Record<string, Dictionary> = {
  en,
  bg,
};

export function getDictionary(locale: string | null | undefined): Dictionary {
  const code = isLocale(locale) ? locale : DEFAULT_LOCALE;
  return messages[code] || messages[DEFAULT_LOCALE];
}

export function resolveLocale(raw: string | null | undefined): LocaleCode {
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export type { Dictionary };
export type { LocaleCode };
