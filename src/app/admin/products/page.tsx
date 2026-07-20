import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, PRODUCT_TYPES } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Продукти — Админ" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Продукти</h1>
          <p className="mt-1 text-sm text-ink-500">Файлове, цени, лицензи и активност</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          + Нов продукт
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Име</th>
              <th className="px-4 py-3 font-medium">Тип</th>
              <th className="px-4 py-3 font-medium">Цена</th>
              <th className="px-4 py-3 font-medium">Категория</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-ink-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink-900">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.slug}</p>
                </td>
                <td className="px-4 py-3">
                  {PRODUCT_TYPES.find((t) => t.value === p.type)?.label || p.type}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(p.price, p.currency)}</td>
                <td className="px-4 py-3 text-ink-600">{p.category?.name || "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.isActive ? "bg-accent/10 text-accent-dark" : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {p.isActive ? "Активен" : "Скрит"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-brand-600 hover:underline">
                    Редакция
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-ink-500">Няма продукти. Създайте първия.</p>
        )}
      </div>
    </div>
  );
}
