import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Промо кодове — Админ" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Промо кодове</h1>
      <div className="mt-8">
        <CouponManager initial={coupons} />
      </div>
    </div>
  );
}
