"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem, cartTotal, clearCart, readCart } from "@/lib/cart";
import { formatPrice, PAYMENT_METHODS } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("DEMO");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [invoiceCompany, setInvoiceCompany] = useState("");
  const [invoiceBulstat, setInvoiceBulstat] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");

  useEffect(() => {
    setItems(readCart());
  }, []);

  const total = cartTotal(items);
  const demoEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO !== "false";

  const methods = PAYMENT_METHODS.filter((m) => m.id !== "DEMO" || demoEnabled);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!session?.user && (!guestEmail || !guestName)) {
        throw new Error("За плащане без акаунт попълнете име и имейл.");
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
          guestEmail: session?.user ? undefined : guestEmail,
          guestName: session?.user ? undefined : guestName,
          couponCode: couponCode || undefined,
          invoiceCompany: invoiceCompany || undefined,
          invoiceBulstat: invoiceBulstat || undefined,
          invoiceAddress: invoiceAddress || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка при плащане");

      clearCart();

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно плащане");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="section-title">Няма продукти за плащане</h1>
        <Link href="/catalog" className="btn-primary mt-8 inline-flex">
          Към каталога
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="section-title mb-2">Плащане</h1>
      <p className="mb-8 text-ink-500">
        Само онлайн. След успешно плащане изтеглянето се активира автоматично.
      </p>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {!session?.user ? (
            <section className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Пазаруване без акаунт</h2>
              <p className="mt-1 text-sm text-ink-500">
                Или{" "}
                <Link href="/login?callbackUrl=/checkout" className="text-brand-600 hover:underline">
                  влезте
                </Link>{" "}
                /{" "}
                <Link href="/register" className="text-brand-600 hover:underline">
                  се регистрирайте
                </Link>
                .
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Име *</label>
                  <input className="input" required value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div>
                  <label className="label">Имейл *</label>
                  <input
                    type="email"
                    className="input"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-ink-100 bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Влезли сте като</h2>
              <p className="mt-2 text-sm text-ink-600">
                {session.user.name || "Потребител"} · {session.user.email}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-display text-lg font-semibold">Метод на плащане</h2>
            <div className="mt-4 space-y-3">
              {methods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === m.id
                      ? "border-brand-500 bg-brand-50/50"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    className="mt-1"
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                  />
                  <span>
                    <span className="block font-medium text-ink-900">{m.label}</span>
                    <span className="text-sm text-ink-500">{m.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-display text-lg font-semibold">Фактура (по желание)</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="label">Фирма</label>
                <input className="input" value={invoiceCompany} onChange={(e) => setInvoiceCompany(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">ЕИК / БУЛСТАТ</label>
                  <input className="input" value={invoiceBulstat} onChange={(e) => setInvoiceBulstat(e.target.value)} />
                </div>
                <div>
                  <label className="label">Адрес</label>
                  <input className="input" value={invoiceAddress} onChange={(e) => setInvoiceAddress(e.target.value)} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="font-display text-lg font-semibold">Поръчка</h2>
          <ul className="mt-4 space-y-3 border-b border-ink-100 pb-4">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 text-sm">
                <span className="text-ink-600">
                  {i.name} × {i.quantity}
                </span>
                <span className="font-medium">{formatPrice(i.price * i.quantity, i.currency)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <label className="label">Промо код</label>
            <input
              className="input"
              placeholder="напр. WELCOME10"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-between">
            <span className="font-semibold">Общо</span>
            <span className="font-display text-2xl font-semibold">{formatPrice(total)}</span>
          </div>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full !py-3">
            {loading ? "Обработка..." : "Плати сега"}
          </button>
          <p className="mt-3 text-center text-xs text-ink-400">
            Auctions Evtinko Ltd. · Защитено плащане
          </p>
        </aside>
      </form>
    </div>
  );
}
