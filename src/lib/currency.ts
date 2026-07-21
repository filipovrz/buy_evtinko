/**
 * Official store currency: EUR (Bulgaria since 2026-01-01).
 * Display options: EUR (default), BGN (until 2026-12-31), USD (optional).
 */

export type StoreCurrency = "EUR";
export type DisplayCurrency = "EUR" | "BGN" | "USD";

export const STORE_CURRENCY: StoreCurrency = "EUR";
export const CURRENCY_COOKIE = "evtinko_display_currency";

/** Official fixed EUR→BGN rate used in Bulgaria */
export const EUR_TO_BGN = 1.95583;

/** EUR→USD — override via NEXT_PUBLIC_EUR_USD_RATE */
export function getEurToUsd(): number {
  const raw = process.env.NEXT_PUBLIC_EUR_USD_RATE || process.env.EUR_USD_RATE || "1.08";
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 1.08;
}

/** BGN dual-display allowed only through end of 2026 */
export function isBgnDisplayAllowed(now = new Date()): boolean {
  return now.getFullYear() < 2027;
}

export function getDisplayCurrencies(now = new Date()): {
  code: DisplayCurrency;
  label: string;
  short: string;
}[] {
  const list: { code: DisplayCurrency; label: string; short: string }[] = [
    { code: "EUR", label: "Euro", short: "EUR" },
  ];
  if (isBgnDisplayAllowed(now)) {
    list.push({ code: "BGN", label: "Лева (до 31.12.2026)", short: "BGN" });
  }
  list.push({ code: "USD", label: "US Dollar", short: "USD" });
  return list;
}

export function isDisplayCurrency(value: string | null | undefined): value is DisplayCurrency {
  if (value === "EUR" || value === "USD") return true;
  if (value === "BGN") return isBgnDisplayAllowed();
  return false;
}

export function resolveDisplayCurrency(raw: string | null | undefined): DisplayCurrency {
  if (isDisplayCurrency(raw)) return raw;
  return "EUR";
}

/** Convert amount stored in EUR to a display currency */
export function convertFromEur(amountEur: number, to: DisplayCurrency): number {
  if (to === "EUR") return amountEur;
  if (to === "BGN") return amountEur * EUR_TO_BGN;
  return amountEur * getEurToUsd();
}

/** If legacy data is in BGN, convert to EUR for storage */
export function convertBgnToEur(amountBgn: number): number {
  return amountBgn / EUR_TO_BGN;
}

export function formatMoney(amount: number, currency: DisplayCurrency | StoreCurrency, locale = "bg-BG") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** EUR amount → BGN at official fixed rate (for dual display until 31.12.2026) */
export function eurToBgn(amountEur: number): number {
  return amountEur * EUR_TO_BGN;
}

/** Compact BGN text for parentheses, e.g. "25,05 лв." */
export function formatBgnCompact(amountEur: number, locale = "bg-BG"): string {
  const bgn = eurToBgn(amountEur);
  const num = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(bgn);
  return `${num} лв.`;
}

/**
 * Format a store (EUR) amount for the selected display currency.
 * Optional secondary line for dual display (e.g. EUR primary + BGN hint).
 */
export function formatStorePrice(
  amountEur: number,
  display: DisplayCurrency = "EUR",
  opts?: { withApproxNote?: boolean }
) {
  const converted = convertFromEur(amountEur, display);
  const primary = formatMoney(converted, display);
  if (display === "EUR" && isBgnDisplayAllowed()) {
    return `${primary} (${formatBgnCompact(amountEur)})`;
  }
  if (!opts?.withApproxNote || display === "EUR") return primary;
  return `${primary} ≈ ${formatMoney(amountEur, "EUR")}`;
}
