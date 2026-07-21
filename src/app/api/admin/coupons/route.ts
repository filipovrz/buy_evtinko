import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  if (!(await requirePermission("coupons"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const coupon = await prisma.coupon.create({
    data: {
      code: String(body.code).toUpperCase().trim(),
      discountType: body.discountType || "PERCENT",
      discountValue: Number(body.discountValue),
      maxUses: body.maxUses || null,
      isActive: true,
    },
  });
  return NextResponse.json(coupon);
}
