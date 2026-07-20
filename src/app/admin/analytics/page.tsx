"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Analytics = {
  days: { date: string; revenue: number; orders: number }[];
  products: { name: string; qty: number; revenue: number }[];
  totals: { revenue: number; orders: number };
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return <p className="text-ink-500">Зареждане на статистики...</p>;
  }

  const maxRev = Math.max(...data.days.map((d) => d.revenue), 1);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Статистики / Charts</h1>
      <p className="mt-1 text-sm text-ink-500">Приходи и поръчки (платени)</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-sm text-ink-500">Общо приходи</p>
          <p className="font-display text-3xl font-semibold">{formatPrice(data.totals.revenue)}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5">
          <p className="text-sm text-ink-500">Платени поръчки</p>
          <p className="font-display text-3xl font-semibold">{data.totals.orders}</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-semibold">Приходи по дни (последни 30)</h2>
        <div className="mt-6 flex h-48 items-end gap-1">
          {data.days.length === 0 && (
            <p className="text-sm text-ink-400">Няма данни още — направете демо покупка.</p>
          )}
          {data.days.map((d) => (
            <div key={d.date} className="group relative flex flex-1 flex-col items-center justify-end">
              <div
                className="w-full min-w-[6px] rounded-t bg-gradient-to-t from-brand-700 to-accent transition hover:opacity-90"
                style={{ height: `${Math.max(4, (d.revenue / maxRev) * 100)}%` }}
                title={`${d.date}: ${formatPrice(d.revenue)} (${d.orders})`}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-ink-400">
          <span>{data.days[0]?.date || ""}</span>
          <span>{data.days[data.days.length - 1]?.date || ""}</span>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-semibold">Топ продукти</h2>
        <ul className="mt-4 space-y-3">
          {data.products.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-ink-800">{p.name}</span>
              <span className="text-ink-500">
                ×{p.qty} · {formatPrice(p.revenue)}
              </span>
            </li>
          ))}
          {data.products.length === 0 && <li className="text-ink-400">Няма продажби.</li>}
        </ul>
      </div>
    </div>
  );
}
