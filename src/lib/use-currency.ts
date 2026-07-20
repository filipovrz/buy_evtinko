"use client";

import { useEffect, useState } from "react";
import {
  CURRENCY_COOKIE,
  DisplayCurrency,
  getDisplayCurrencies,
  resolveDisplayCurrency,
} from "@/lib/currency";

function readCookie(): DisplayCurrency {
  if (typeof document === "undefined") return "EUR";
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`));
  return resolveDisplayCurrency(match?.[1]);
}

export function useCurrency() {
  const [currency, setCurrencyState] = useState<DisplayCurrency>("EUR");
  const options = getDisplayCurrencies();

  useEffect(() => {
    setCurrencyState(readCookie());
    const sync = () => setCurrencyState(readCookie());
    window.addEventListener("currency-updated", sync);
    return () => window.removeEventListener("currency-updated", sync);
  }, []);

  function setCurrency(next: DisplayCurrency) {
    const resolved = resolveDisplayCurrency(next);
    document.cookie = `${CURRENCY_COOKIE}=${resolved};path=/;max-age=31536000;samesite=lax`;
    setCurrencyState(resolved);
    window.dispatchEvent(new Event("currency-updated"));
  }

  return { currency, setCurrency, options };
}
