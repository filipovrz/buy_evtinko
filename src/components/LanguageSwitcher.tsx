"use client";

import { useI18n } from "@/i18n/use-i18n";
import type { LocaleCode } from "@/i18n/config";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, locales } = useI18n();

  return (
    <select
      aria-label="Language"
      className={`rounded-md border border-white/15 bg-ink-900/80 px-2 py-1.5 text-xs font-medium text-ink-200 outline-none hover:border-white/30 ${className}`}
      value={locale}
      onChange={(e) => setLocale(e.target.value as LocaleCode)}
    >
      {locales.map((l) => (
        <option key={l.code} value={l.code}>
          {l.short}
        </option>
      ))}
    </select>
  );
}
