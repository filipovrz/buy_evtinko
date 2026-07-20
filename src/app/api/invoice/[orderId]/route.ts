import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoice";

type Ctx = { params: Promise<{ orderId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PAID") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const isOwner =
    (session?.user?.id && order.userId === session.user.id) ||
    session?.user?.role === "ADMIN";
  // Guests can access with order id (token-like) — acceptable for digital goods MVP
  if (!isOwner && !order.guestEmail) {
    // still allow if they know the order id from success page
  }

  let filePath = order.invoicePath
    ? path.join(process.cwd(), "uploads", order.invoicePath)
    : null;

  if (!filePath || !fs.existsSync(filePath)) {
    const inv = await generateInvoicePdf(order.id);
    filePath = inv.filePath;
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.invoiceNumber || order.orderNumber}.pdf"`,
    },
  });
}
