"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/use-i18n";

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usedCount: number;
  maxUses: number | null;
  isActive: boolean;
};

export function CouponManager({ initial }: { initial: Coupon[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("10");
  const [discountType, setDiscountType] = useState("PERCENT");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountType,
        discountValue: parseFloat(discountValue),
      }),
    });
    setCode("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4">
        <input
          className="input max-w-[160px]"
          placeholder="CODE"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <select className="input max-w-[140px]" value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
          <option value="PERCENT">%</option>
          <option value="FIXED">Fixed EUR</option>
        </select>
        <input
          className="input max-w-[100px]"
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          {t.admin.add}
        </button>
      </form>
      <div className="space-y-2">
        {initial.map((c) => (
          <div key={c.id} className="flex justify-between rounded-xl border border-ink-100 bg-white px-4 py-3 text-sm">
            <span className="font-mono font-semibold">{c.code}</span>
            <span>
              {c.discountType === "PERCENT" ? `${c.discountValue}%` : `${c.discountValue} EUR`} · used{" "}
              {c.usedCount}
              {c.maxUses ? `/${c.maxUses}` : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
