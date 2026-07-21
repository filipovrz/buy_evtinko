import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";
import { getServerDictionary } from "@/i18n/server";
import { guardAdminPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.coupons} — Admin` };
}

export default async function AdminCouponsPage() {
  await guardAdminPage("coupons");
  const { t } = await getServerDictionary();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.coupons}</h1>
      <div className="mt-8">
        <CouponManager initial={coupons} />
      </div>
    </div>
  );
}
