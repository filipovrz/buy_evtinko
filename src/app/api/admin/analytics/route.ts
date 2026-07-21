import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await requirePermission("analytics"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const paid = await prisma.order.findMany({
    where: { status: "PAID" },
    select: { total: true, paidAt: true, createdAt: true, currency: true },
    orderBy: { paidAt: "asc" },
  });

  const byDay: Record<string, { revenue: number; orders: number }> = {};
  for (const o of paid) {
    const d = (o.paidAt || o.createdAt).toISOString().slice(0, 10);
    if (!byDay[d]) byDay[d] = { revenue: 0, orders: 0 };
    byDay[d].revenue += o.total;
    byDay[d].orders += 1;
  }

  const topProducts = await prisma.orderItem.groupBy({
    by: ["productName"],
    _sum: { quantity: true, unitPrice: true },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  // Approximate revenue per product name
  const productStats = await Promise.all(
    topProducts.map(async (p) => {
      const items = await prisma.orderItem.findMany({
        where: { productName: p.productName, order: { status: "PAID" } },
      });
      return {
        name: p.productName,
        qty: items.reduce((s, i) => s + i.quantity, 0),
        revenue: items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
      };
    })
  );

  const days = Object.entries(byDay)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  return NextResponse.json({
    days,
    products: productStats,
    totals: {
      revenue: paid.reduce((s, o) => s + o.total, 0),
      orders: paid.length,
    },
  });
}
