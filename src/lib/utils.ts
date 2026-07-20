import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number, currency = "BGN") {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateOrderNumber() {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `EV-${stamp}-${rand}`;
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export const PRODUCT_TYPES = [
  { value: "SOFTWARE", label: "Софтуер" },
  { value: "APP", label: "Апликация" },
  { value: "APPLICATION", label: "Приложение" },
  { value: "FILE", label: "Файл" },
  { value: "OTHER", label: "Друго" },
] as const;

export const PAYMENT_METHODS = [
  { id: "STRIPE", label: "Кредитна / дебитна карта", desc: "Visa, Mastercard (Stripe)" },
  { id: "PAYPAL", label: "PayPal", desc: "Плащане с PayPal акаунт" },
  { id: "EPAY", label: "ePay.bg", desc: "Българска платежна система" },
  { id: "DEMO", label: "Демо плащане", desc: "Автоматично одобрение (тест)" },
] as const;
