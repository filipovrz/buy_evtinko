"use client";

import { addToCart } from "@/lib/cart";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

type Props = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    coverImage?: string | null;
  };
};

export function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className="btn-primary !px-6 !py-3"
      onClick={() => {
        addToCart({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          currency: product.currency,
          coverImage: product.coverImage,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {added ? "Добавено в количката" : "Добави в количката"}
    </button>
  );
}
