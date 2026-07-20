import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Админ табло" };

export default async function AdminDashboard() {
  const [products, orders, users, revenue, pending, messages] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  const recent = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { items: true },
  });

  const stats = [
    { label: "Продукти", value: String(products), href: "/admin/products" },
    { label: "Поръчки", value: String(orders), href: "/admin/orders" },
    { label: "Приходи (платени)", value: formatPrice(revenue._sum.total || 0), href: "/admin/orders" },
    { label: "Чакащи", value: String(pending), href: "/admin/orders" },
    { label: "Потребители", value: String(users), href: "/admin/users" },
    { label: "Нови съобщения", value: String(messages), href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950">Табло</h1>
      <p className="mt-1 text-sm text-ink-500">Управление на buy-software.evtinko-bg.com</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-brand-200"
          >
            <p className="text-sm text-ink-500">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink-950">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-ink-100 bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="font-semibold">Последни поръчки</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
            Всички
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {recent.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-ink-500">
                  {o.guestEmail || "потребител"} · {o.items.length} артикула · {o.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
                <p className={o.status === "PAID" ? "text-accent" : "text-ink-400"}>{o.status}</p>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-ink-500">Няма поръчки.</p>
          )}
        </div>
      </div>
    </div>
  );
}
