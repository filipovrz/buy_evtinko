"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";

export function WishlistButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!session?.user) {
    return (
      <Link href="/login?callbackUrl=/account/wishlist" className="btn-secondary !px-4 !py-3" title="Wishlist">
        <Heart className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className="btn-secondary !px-4 !py-3"
      disabled={loading || done}
      onClick={async () => {
        setLoading(true);
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        setLoading(false);
        setDone(true);
      }}
      title="Add to wishlist"
    >
      <Heart className={`h-4 w-4 ${done ? "fill-red-500 text-red-500" : ""}`} />
      {done ? "✓" : ""}
    </button>
  );
}
