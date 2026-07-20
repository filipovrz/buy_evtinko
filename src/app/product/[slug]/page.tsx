import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice, formatBytes, parseJsonArray, PRODUCT_TYPES } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import Link from "next/link";
import { Check, Monitor, Package } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Продукт" };
  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDesc,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isActive) notFound();

  const features = parseJsonArray(product.features);
  const typeLabel = PRODUCT_TYPES.find((t) => t.value === product.type)?.label || product.type;

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="mb-6 text-sm text-ink-500">
        <Link href="/catalog" className="hover:text-brand-600">
          Каталог
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink-800">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-ink-100 bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.coverImage || "/images/products/placeholder.svg"}
            alt={product.name}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>

        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {typeLabel}
            </span>
            {product.platform && (
              <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                <Monitor className="h-3.5 w-3.5" /> {product.platform}
              </span>
            )}
            {product.version && (
              <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700">
                <Package className="h-3.5 w-3.5" /> v{product.version}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-950 md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-ink-600">{product.shortDesc}</p>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-4xl font-semibold text-ink-950">
              {formatPrice(product.price, product.currency)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="pb-1 text-lg text-ink-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </p>
            )}
          </div>

          <p className="mt-2 text-sm text-ink-500">
            Лиценз: {product.licenseType} · До {product.downloadLimit} изтегляния след покупка
            {product.fileSize ? ` · ${formatBytes(product.fileSize)}` : ""}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <Link href="/cart" className="btn-secondary">
              Към количката
            </Link>
          </div>

          {features.length > 0 && (
            <ul className="mt-8 space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-ink-100 bg-white p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold">Описание</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-600">{product.description}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold">Изисквания</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            {product.requirements || "Няма посочени специални изисквания."}
          </p>
          <div className="mt-6 border-t border-ink-100 pt-6 text-sm text-ink-500">
            <p>Продавач: Auctions Evtinko Ltd.</p>
            <p className="mt-1">Плащане: карта · PayPal · ePay.bg</p>
            <p className="mt-1">Изтегляне: автоматично след плащане</p>
          </div>
        </div>
      </div>
    </div>
  );
}
