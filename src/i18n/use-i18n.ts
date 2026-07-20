"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, type LocaleCode } from "./config";
import { getDictionary, type Dictionary } from "./get-dictionary";

function readCookie(): LocaleCode {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const val = match?.[1];
  return LOCALES.some((l) => l.code === val) ? (val as LocaleCode) : DEFAULT_LOCALE;
}

export function useI18n() {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [dict, setDict] = useState<Dictionary>(() => getDictionary(DEFAULT_LOCALE));

  useEffect(() => {
    const loc = readCookie();
    setLocaleState(loc);
    setDict(getDictionary(loc));
    const sync = () => {
      const next = readCookie();
      setLocaleState(next);
      setDict(getDictionary(next));
    };
    window.addEventListener("locale-updated", sync);
    return () => window.removeEventListener("locale-updated", sync);
  }, []);

  function setLocale(next: LocaleCode) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
    setLocaleState(next);
    setDict(getDictionary(next));
    window.dispatchEvent(new Event("locale-updated"));
    // Reload so server components also pick the new locale cookie
    window.location.reload();
  }

  return { locale, setLocale, t: dict, locales: LOCALES };
}
