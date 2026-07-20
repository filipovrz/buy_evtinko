"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CartItem,
  cartTotal,
  readCart,
  removeFromCart,
  updateCartQty,
} from "@/lib/cart";
import { Price } from "@/components/Price";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";

export default function CartPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const sync = () => setItems(readCart());
    window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);

  const total = cartTotal(items);

  if (items.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="section-title">{t.cart.empty}</h1>
        <p className="mt-3 text-ink-500">{t.cart.emptyHint}</p>
        <Link href="/catalog" className="btn-primary mt-8 inline-flex">
          {t.cart.toCatalog}
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="section-title mb-8">{t.cart.title}</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="h-20 w-28 overflow-hidden rounded-xl bg-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.coverImage || "/images/products/placeholder.svg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-semibold text-ink-900 hover:text-brand-700">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-ink-500">
                  <Price amount={item.price} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-ink-200 p-1.5 hover:bg-ink-50"
                  onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  className="rounded-lg border border-ink-200 p-1.5 hover:bg-ink-50"
                  onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="ml-2 rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                  onClick={() => removeFromCart(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="min-w-[90px] text-right font-semibold">
                <Price amount={item.price * item.quantity} />
              </p>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold">{t.cart.summary}</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink-500">{t.cart.subtotal}</span>
            <span className="font-medium">
              <Price amount={total} />
            </span>
          </div>
          <div className="mt-2 flex justify-between border-t border-ink-100 pt-3 text-base">
            <span className="font-semibold">{t.cart.total}</span>
            <span className="font-display text-xl font-semibold">
              <Price amount={total} showEurHint />
            </span>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            {t.cart.checkout}
          </Link>
          <p className="mt-3 text-center text-xs text-ink-400">{t.cart.guestHint}</p>
        </aside>
      </div>
    </div>
  );
}
