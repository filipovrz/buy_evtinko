import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Поръчки" };

export default async function OrdersPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/account/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      downloads: true,
    },
  });

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title">Поръчки</h1>
        <Link href="/account" className="btn-ghost">
          ← Акаунт
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink-900">{order.orderNumber}</p>
                <p className="text-sm text-ink-500">
                  {new Date(order.createdAt).toLocaleString("bg-BG")} · {order.paymentMethod} ·{" "}
                  <span className={order.status === "PAID" ? "text-accent" : ""}>{order.status}</span>
                </p>
              </div>
              <p className="font-display text-xl font-semibold">
                {formatPrice(order.total, order.currency)}
              </p>
            </div>
            <ul className="mt-4 space-y-3 border-t border-ink-100 pt-4">
              {order.items.map((item) => {
                const dl = order.downloads.find((d) => d.productId === item.productId);
                return (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <Link href={`/product/${item.productSlug}`} className="font-medium hover:text-brand-700">
                        {item.productName}
                      </Link>
                      {item.licenseKey && (
                        <p className="font-mono text-xs text-ink-400">Ключ: {item.licenseKey}</p>
                      )}
                    </div>
                    {dl && order.status === "PAID" && (
                      <a href={`/api/download/${dl.token}`} className="btn-secondary !py-1.5 !text-xs">
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
        {orders.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink-200 p-10 text-center text-ink-500">
            Няма поръчки.{" "}
            <Link href="/catalog" className="text-brand-600 hover:underline">
              Към каталога
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
