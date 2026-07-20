"use client";

import Link from "next/link";
import { ShoppingCart, Download } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
import { Price } from "@/components/Price";
import { useI18n } from "@/i18n/use-i18n";
import { localizeContent } from "@/i18n/localize";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string;
    price: number;
    compareAtPrice?: number | null;
    currency: string;
    type: string;
    platform?: string | null;
    coverImage?: string | null;
    isFeatured?: boolean;
    translations?: string | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const { t, locale } = useI18n();
  const [added, setAdded] = useState(false);
  const loc = localizeContent(product, locale);
  const typeLabel =
    t.productTypes[product.type as keyof typeof t.productTypes] || product.type;

  function handleAdd() {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: loc.name,
      price: product.price,
      currency: "EUR",
      coverImage: product.coverImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-ink-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.coverImage || "/images/products/placeholder.svg"}
          alt={loc.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {typeLabel}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.slug}`} className="font-display text-lg font-semibold text-ink-950 hover:text-brand-700">
          {loc.name}
        </Link>
        {product.platform && (
          <p className="mb-2 mt-1 text-xs font-medium text-accent">{product.platform}</p>
        )}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-500">{loc.shortDesc}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold text-ink-950">
              <Price amount={product.price} showEurHint />
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-xs text-ink-400 line-through">
                <Price amount={product.compareAtPrice} />
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} className="btn-secondary !px-3 !py-2" title={t.common.details}>
              <Download className="h-4 w-4" />
            </Link>
            <button type="button" onClick={handleAdd} className="btn-primary !px-3 !py-2">
              <ShoppingCart className="h-4 w-4" />
              {added ? t.common.added : t.common.buy}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
