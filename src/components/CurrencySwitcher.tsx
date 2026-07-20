"use client";

import { useCurrency } from "@/lib/use-currency";
import type { DisplayCurrency } from "@/lib/currency";

export function CurrencySwitcher({ className = "" }: { className?: string }) {
  const { currency, setCurrency, options } = useCurrency();

  return (
    <select
      aria-label="Currency"
      title="Валута / Currency"
      className={`rounded-md border border-white/15 bg-ink-900/80 px-2 py-1.5 text-xs font-medium text-ink-200 outline-none hover:border-white/30 ${className}`}
      value={currency}
      onChange={(e) => setCurrency(e.target.value as DisplayCurrency)}
    >
      {options.map((o) => (
        <option key={o.code} value={o.code}>
          {o.short}
        </option>
      ))}
    </select>
  );
}
