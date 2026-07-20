"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className="btn-secondary !text-xs"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/admin/orders/${orderId}/mark-paid`, { method: "POST" });
        setLoading(false);
        router.refresh();
      }}
    >
      {loading ? "..." : "Ръчно одобри (платено)"}
    </button>
  );
}
