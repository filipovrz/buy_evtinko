import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RemoveWishlistButton } from "@/components/RemoveWishlistButton";
import { Price } from "@/components/Price";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist / Любими" };

export default async function WishlistPage() {
  const session = await getSession();
  if (!session?.user) redirect("/login?callbackUrl=/account/wishlist");

  const items = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title">Любими / Wishlist</h1>
        <Link href="/account" className="btn-ghost">
          ← Акаунт
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((w) => (
          <div key={w.id} className="rounded-2xl border border-ink-100 bg-white p-5">
            <Link href={`/product/${w.product.slug}`} className="font-display text-lg font-semibold hover:text-brand-700">
              {w.product.name}
            </Link>
            <p className="mt-1 text-sm text-ink-500">{w.product.shortDesc}</p>
            <p className="mt-3 font-semibold"><Price amount={w.product.price} showEurHint /></p>
            <div className="mt-4 flex gap-2">
              <Link href={`/product/${w.product.slug}`} className="btn-primary !py-2 !text-xs">
                Виж
              </Link>
              <RemoveWishlistButton productId={w.productId} />
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink-200 p-10 text-center text-ink-500">
          Нямате любими продукти.{" "}
          <Link href="/catalog" className="text-brand-600 hover:underline">
            Каталог
          </Link>
        </p>
      )}
    </div>
  );
}
