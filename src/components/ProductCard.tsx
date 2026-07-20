"use client";

import Link from "next/link";
import { ShoppingCart, Download } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { formatPrice, PRODUCT_TYPES } from "@/lib/utils";
import { useState } from "react";

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
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const typeLabel = PRODUCT_TYPES.find((t) => t.value === product.type)?.label || product.type;

  function handleAdd() {
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
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
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-md bg-ink-950/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {typeLabel}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-start justify-between gap-2">
          <Link href={`/product/${product.slug}`} className="font-display text-lg font-semibold text-ink-950 hover:text-brand-700">
            {product.name}
          </Link>
        </div>
        {product.platform && (
          <p className="mb-2 text-xs font-medium text-accent">{product.platform}</p>
        )}
        <p className="mb-4 flex-1 text-sm leading-relaxed text-ink-500">{product.shortDesc}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold text-ink-950">
              {formatPrice(product.price, product.currency)}
            </p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-xs text-ink-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} className="btn-secondary !px-3 !py-2" title="Детайли">
              <Download className="h-4 w-4" />
            </Link>
            <button type="button" onClick={handleAdd} className="btn-primary !px-3 !py-2">
              <ShoppingCart className="h-4 w-4" />
              {added ? "Добавено" : "Купи"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
