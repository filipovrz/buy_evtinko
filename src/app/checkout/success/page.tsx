import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Download } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          items: true,
          downloads: true,
        },
      })
    : null;

  return (
    <div className="container-page py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="section-title">Плащането е успешно</h1>
        <p className="mt-3 text-ink-500">
          Поръчката е одобрена автоматично. Изпратихме имейл с линкове за изтегляне
          (или записан в data/mail-outbox ако SMTP още не е настроен). Можете да изтеглите файловете по-долу.
        </p>
        {order && (
          <p className="mt-2 text-sm font-medium text-ink-700">
            № {order.orderNumber} · {formatPrice(order.total, order.currency)} · {order.status}
          </p>
        )}
      </div>

      {order && (
        <div className="mx-auto mt-10 max-w-2xl space-y-4">
          {order.items.map((item) => {
            const dl = order.downloads.find((d) => d.productId === item.productId);
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink-900">{item.productName}</p>
                  {item.licenseKey && (
                    <p className="mt-1 font-mono text-xs text-ink-500">Лиценз: {item.licenseKey}</p>
                  )}
                </div>
                {dl && order.status === "PAID" ? (
                  <a href={`/api/download/${dl.token}`} className="btn-primary">
                    <Download className="h-4 w-4" /> Изтегли
                  </a>
                ) : (
                  <span className="text-sm text-ink-400">Изчакване на плащане…</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex justify-center gap-3">
        {order?.status === "PAID" && (
          <a href={`/api/invoice/${order.id}`} className="btn-secondary">
            Фактура PDF
          </a>
        )}
        <Link href="/account/orders" className="btn-secondary">
          Моите поръчки
        </Link>
        <Link href="/catalog" className="btn-primary">
          Към каталога
        </Link>
      </div>
    </div>
  );
}
