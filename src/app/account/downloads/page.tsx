import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Изтегляния" };

export default async function DownloadsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/account/downloads");

  const downloads = await prisma.download.findMany({
    where: { order: { userId: session.user.id, status: "PAID" } },
    include: { order: { include: { items: true } } },
    orderBy: { createdAt: "desc" },
  });

  const products = await prisma.product.findMany({
    where: { id: { in: downloads.map((d) => d.productId) } },
  });

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title">Изтегляния</h1>
        <Link href="/account" className="btn-ghost">
          ← Акаунт
        </Link>
      </div>
      <div className="space-y-3">
        {downloads.map((dl) => {
          const product = products.find((p) => p.id === dl.productId);
          return (
            <div
              key={dl.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-5 py-4"
            >
              <div>
                <p className="font-medium">{product?.name || "Продукт"}</p>
                <p className="text-xs text-ink-500">
                  Поръчка {dl.order.orderNumber} · {dl.downloadCount}/{dl.maxDownloads} изтегляния ·
                  валиден до {new Date(dl.expiresAt).toLocaleDateString("bg-BG")}
                </p>
              </div>
              <a href={`/api/download/${dl.token}`} className="btn-primary !py-2">
                <Download className="h-4 w-4" /> Изтегли
              </a>
            </div>
          );
        })}
        {downloads.length === 0 && (
          <p className="text-ink-500">Няма активни изтегляния.</p>
        )}
      </div>
    </div>
  );
}
