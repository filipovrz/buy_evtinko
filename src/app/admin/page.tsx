import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { getServerDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.dashboard} — Admin` };
}

export default async function AdminDashboard() {
  const { t } = await getServerDictionary();
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
    { label: t.admin.products, value: String(products), href: "/admin/products" },
    { label: t.admin.orders, value: String(orders), href: "/admin/orders" },
    { label: `${t.admin.orders} (PAID)`, value: formatPrice(revenue._sum.total || 0), href: "/admin/orders" },
    { label: "Pending", value: String(pending), href: "/admin/orders" },
    { label: t.admin.users, value: String(users), href: "/admin/users" },
    { label: t.admin.messages, value: String(messages), href: "/admin/messages" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950">{t.admin.dashboard}</h1>
      <p className="mt-1 text-sm text-ink-500">buy-software.evtinko-bg.com</p>

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
          <h2 className="font-semibold">{t.account.recentOrders}</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
            {t.common.viewAll}
          </Link>
        </div>
        <div className="divide-y divide-ink-100">
          {recent.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-ink-500">
                  {o.guestEmail || "user"} · {o.items.length} · {o.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
                <p className={o.status === "PAID" ? "text-accent" : "text-ink-400"}>{o.status}</p>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-ink-500">{t.account.noOrders}</p>
          )}
        </div>
      </div>
    </div>
  );
}
