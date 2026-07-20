import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatBytes, parseJsonArray } from "@/lib/utils";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Price } from "@/components/Price";
import Link from "next/link";
import { Check, Monitor, Package } from "lucide-react";
import { getServerDictionary } from "@/i18n/server";
import { localizeContent } from "@/i18n/localize";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { locale } = await getServerDictionary();
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product" };
  const loc = localizeContent(product, locale);
  return {
    title: product.metaTitle || loc.name,
    description: product.metaDescription || loc.shortDesc,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { locale, t } = await getServerDictionary();
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isActive) notFound();

  const loc = localizeContent(product, locale);
  const features = parseJsonArray(loc.features);
  const typeLabel =
    t.productTypes[product.type as keyof typeof t.productTypes] || product.type;
  const categoryLoc = product.category
    ? localizeContent(
        {
          name: product.category.name,
          shortDesc: product.category.description,
          translations: product.category.translations,
        },
        locale
      )
    : null;

  return (
    <div className="container-page py-10 md:py-14">
      <nav className="mb-6 text-sm text-ink-500">
        <Link href="/catalog" className="hover:text-brand-600">
          {t.nav.catalog}
        </Link>
        {product.category && categoryLoc && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/catalog?category=${product.category.slug}`} className="hover:text-brand-600">
              {categoryLoc.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-ink-800">{loc.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-ink-100 bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.coverImage || "/images/products/placeholder.svg"}
            alt={loc.name}
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
            {loc.name}
          </h1>
          <p className="mt-3 text-lg text-ink-600">{loc.shortDesc}</p>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-4xl font-semibold text-ink-950">
              <Price amount={product.price} showEurHint />
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="pb-1 text-lg text-ink-400 line-through">
                <Price amount={product.compareAtPrice} />
              </p>
            )}
          </div>

          <p className="mt-2 text-sm text-ink-500">
            {t.product.officialCurrency} · {t.product.license}: {product.licenseType} ·{" "}
            {product.downloadLimit} {t.product.downloads}
            {product.fileSize ? ` · ${formatBytes(product.fileSize)}` : ""}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <AddToCartButton
              product={{
                ...product,
                name: loc.name,
              }}
            />
            <WishlistButton productId={product.id} />
            <Link href="/cart" className="btn-secondary">
              {t.product.toCart}
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
        <div className="rounded-2xl border border-ink-100 bg-white p-6 md:p-8 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">{t.product.description}</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-600">{loc.description}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold">{t.product.requirements}</h2>
          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            {loc.requirements || t.product.noRequirements}
          </p>
          <div className="mt-6 border-t border-ink-100 pt-6 text-sm text-ink-500">
            <p>
              {t.product.seller}: {t.common.company}
            </p>
            <p className="mt-1">{t.product.payment}</p>
            <p className="mt-1">{t.product.downloadAuto}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
