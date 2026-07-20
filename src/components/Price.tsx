"use client";

import { convertFromEur, formatMoney, type DisplayCurrency } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";

type Props = {
  /** Amount in store currency (EUR) */
  amount: number;
  className?: string;
  /** Show ≈ EUR when viewing BGN/USD */
  showEurHint?: boolean;
  /** Force a display currency (skip cookie) */
  force?: DisplayCurrency;
};

/** Client price that respects EUR / BGN / USD preference */
export function Price({ amount, className, showEurHint = false, force }: Props) {
  const { currency } = useCurrency();
  const display = force || currency;
  const value = convertFromEur(amount, display);
  const primary = formatMoney(value, display);

  return (
    <span className={className}>
      {primary}
      {showEurHint && display !== "EUR" && (
        <span className="ml-1 text-[0.85em] font-normal opacity-60">
          (≈ {formatMoney(amount, "EUR")})
        </span>
      )}
    </span>
  );
}
