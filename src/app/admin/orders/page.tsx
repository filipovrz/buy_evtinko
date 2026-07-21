import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";
import { getServerDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.orders} — Admin` };
}

export default async function AdminOrdersPage() {
  const { t } = await getServerDictionary();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.orders}</h1>

      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <article key={o.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-sm text-ink-500">
                  {new Date(o.createdAt).toLocaleString("en-GB")} ·{" "}
                  {o.user?.email || o.guestEmail || "—"} · {o.paymentMethod}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-semibold">
                  {formatPrice(o.total, o.currency)}
                </p>
                <p className={o.status === "PAID" ? "text-accent text-sm" : "text-sm text-ink-400"}>
                  {o.status}
                </p>
              </div>
            </div>
            <ul className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm text-ink-600">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.productName} × {i.quantity} — {formatPrice(i.unitPrice * i.quantity, o.currency)}
                </li>
              ))}
            </ul>
            {o.status === "PENDING" && (
              <div className="mt-3">
                <MarkPaidButton orderId={o.id} />
              </div>
            )}
          </article>
        ))}
        {orders.length === 0 && <p className="text-ink-500">{t.account.noOrders}</p>}
      </div>
    </div>
  );
}
