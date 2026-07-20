import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Моят акаунт" };

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { items: true },
  });

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="section-title">Моят акаунт</h1>
      <p className="mt-2 text-ink-500">
        Здравейте, {session.user.name || session.user.email}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/account/orders", title: "Поръчки", desc: "История и статуси" },
          { href: "/account/downloads", title: "Изтегляния", desc: "Линкове и лицензи" },
          { href: "/account/wishlist", title: "Любими", desc: "Wishlist" },
          { href: "/account/profile", title: "Профил", desc: "Име, телефон, фирма" },
          { href: "/account/password", title: "Смяна на парола", desc: "Сигурност на акаунта" },
          { href: "/catalog", title: "Каталог", desc: "Купи нов продукт" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-ink-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-sm"
          >
            <p className="font-semibold text-ink-900">{item.title}</p>
            <p className="mt-1 text-sm text-ink-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {session.user.role === "ADMIN" && (
        <Link href="/admin" className="btn-accent mt-6 inline-flex">
          Отвори админ панел
        </Link>
      )}

      <h2 className="mt-12 font-display text-xl font-semibold">Последни поръчки</h2>
      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-5 py-4">
            <div>
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-sm text-ink-500">
                {o.items.length} продукта · {o.status}
              </p>
            </div>
            <p className="font-semibold">{formatPrice(o.total, o.currency)}</p>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-sm text-ink-500">Все още нямате поръчки.</p>
        )}
      </div>
    </div>
  );
}
