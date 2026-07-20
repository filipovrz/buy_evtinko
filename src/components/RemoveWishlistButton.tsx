"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveWishlistButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className="btn-secondary !py-2 !text-xs"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setLoading(false);
        router.refresh();
      }}
    >
      Премахни
    </button>
  );
}
