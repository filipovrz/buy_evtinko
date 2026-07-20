import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.paymentId) {
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    return NextResponse.redirect(new URL("/checkout/cancel", req.url));
  }

  const base =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = await tokenRes.json();

  const captureRes = await fetch(`${base}/v2/checkout/orders/${order.paymentId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
  });
  const capture = await captureRes.json();

  if (capture.status === "COMPLETED" || capture.status === "APPROVED") {
    await markOrderPaid(order.id, capture.id || order.paymentId);
    return NextResponse.redirect(
      new URL(`/checkout/success?order=${order.orderNumber}`, req.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/checkout/cancel?order=${order.orderNumber}`, req.url)
  );
}
