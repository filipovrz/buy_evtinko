import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
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
