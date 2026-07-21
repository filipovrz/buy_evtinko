"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export function DeleteProductButton({ productId }: { productId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      className="text-sm text-red-600 hover:underline"
      disabled={loading}
      onClick={async () => {
        if (!confirm(t.admin.confirmDelete)) return;
        setLoading(true);
        await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
        setLoading(false);
        router.refresh();
      }}
    >
      {t.admin.delete}
    </button>
  );
}
