"use client";

import {
  convertFromEur,
  formatBgnCompact,
  formatMoney,
  isBgnDisplayAllowed,
  type DisplayCurrency,
} from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

type Props = {
  /** Amount in store currency (EUR) — set by admin */
  amount: number;
  className?: string;
  /** Show ≈ EUR when viewing BGN/USD */
  showEurHint?: boolean;
  /**
   * Show BGN in smaller parentheses next to EUR (until 31.12.2026).
   * Default: on whenever dual-display window is active.
   */
  showBgnHint?: boolean;
  /** Force a display currency (skip cookie) */
  force?: DisplayCurrency;
};

/**
 * Client price: admin stores EUR; shoppers see EUR + auto BGN (1.95583) until end of 2026.
 * Currency switcher can still preview BGN/USD as primary.
 */
export function Price({
  amount,
  className,
  showEurHint = false,
  showBgnHint,
  force,
}: Props) {
  const { currency } = useCurrency();
  const display = force || currency;
  const value = convertFromEur(amount, display);
  const primary = formatMoney(value, display);
  const bgnAllowed = isBgnDisplayAllowed();
  const withBgn = showBgnHint ?? bgnAllowed;

  return (
    <span className={className}>
      {primary}
      {withBgn && display === "EUR" && (
        <span className="ml-1 text-[0.65em] font-normal leading-none text-ink-500">
          ({formatBgnCompact(amount)})
        </span>
      )}
      {showEurHint && display !== "EUR" && (
        <span className="ml-1 text-[0.65em] font-normal leading-none opacity-70">
          (≈ {formatMoney(amount, "EUR")}
          {withBgn && display === "USD" ? ` · ${formatBgnCompact(amount)}` : ""})
        </span>
      )}
    </span>
  );
}
