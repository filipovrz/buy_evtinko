import crypto from "crypto";
import { prisma } from "./prisma";
import { generateOrderNumber } from "./utils";

export type CheckoutItem = {
  productId: string;
  quantity: number;
};

export type CheckoutInput = {
  items: CheckoutItem[];
  paymentMethod: "STRIPE" | "PAYPAL" | "EPAY" | "DEMO";
  guestEmail?: string;
  guestName?: string;
  userId?: string;
  invoiceCompany?: string;
  invoiceBulstat?: string;
  invoiceAddress?: string;
  couponCode?: string;
};

export async function createOrderFromCheckout(input: CheckoutInput) {
  if (!input.items.length) throw new Error("Количката е празна.");

  const products = await prisma.product.findMany({
    where: {
      id: { in: input.items.map((i) => i.productId) },
      isActive: true,
    },
  });

  if (products.length !== input.items.length) {
    throw new Error("Някои продукти вече не са налични.");
  }

  const lines = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      product,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    };
  });

  let subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  let discount = 0;

  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.toUpperCase().trim() },
    });
    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minOrder || subtotal >= coupon.minOrder)
    ) {
      discount =
        coupon.discountType === "PERCENT"
          ? (subtotal * coupon.discountValue) / 100
          : coupon.discountValue;
      discount = Math.min(discount, subtotal);
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  const total = Math.max(0, subtotal - discount);
  const currency = products[0]?.currency || "BGN";

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: input.userId || null,
      guestEmail: input.guestEmail?.toLowerCase().trim() || null,
      guestName: input.guestName || null,
      status: "PENDING",
      paymentMethod: input.paymentMethod,
      paymentStatus: "PENDING",
      subtotal,
      tax: 0,
      total,
      currency,
      invoiceCompany: input.invoiceCompany || null,
      invoiceBulstat: input.invoiceBulstat || null,
      invoiceAddress: input.invoiceAddress || null,
      items: {
        create: lines.map((l) => ({
          productId: l.product.id,
          productName: l.product.name,
          productSlug: l.product.slug,
          unitPrice: l.product.price,
          quantity: l.quantity,
          licenseKey: generateLicenseKey(),
        })),
      },
    },
    include: { items: true },
  });

  return order;
}

function generateLicenseKey() {
  const parts = Array.from({ length: 4 }, () =>
    crypto.randomBytes(2).toString("hex").toUpperCase()
  );
  return parts.join("-");
}

/** Automatic approval after successful payment webhook / callback */
export async function markOrderPaid(orderId: string, paymentId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Поръчката не е намерена.");
  if (order.status === "PAID") return order;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      paymentStatus: "COMPLETED",
      paymentId: paymentId || order.paymentId,
      paidAt: new Date(),
    },
    include: { items: true },
  });

  // Create secure download tokens (auto-approve access)
  for (const item of updated.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.download.create({
      data: {
        orderId: updated.id,
        productId: item.productId,
        token: crypto.randomBytes(32).toString("hex"),
        maxDownloads: product?.downloadLimit ?? 5,
        expiresAt,
      },
    });
  }

  return updated;
}

export function encodeEpayChecksum(data: string, secret: string) {
  return crypto.createHmac("sha1", secret).update(data).digest("hex");
}

export function buildEpayPayload(opts: {
  min: string;
  invoice: string;
  amount: string;
  currency: string;
  expDate: string;
  description: string;
  secret: string;
}) {
  const encoded = Buffer.from(
    [
      `MIN=${opts.min}`,
      `INVOICE=${opts.invoice}`,
      `AMOUNT=${opts.amount}`,
      `CURRENCY=${opts.currency}`,
      `EXP_TIME=${opts.expDate}`,
      `DESCR=${opts.description}`,
    ].join("\n")
  ).toString("base64");

  const checksum = encodeEpayChecksum(encoded, opts.secret);
  return { encoded, checksum };
}

export async function createStripeCheckoutSession(order: {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  guestEmail?: string | null;
  items: { productName: string; unitPrice: number; quantity: number }[];
}) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe не е конфигуриран.");

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(key);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: order.guestEmail || undefined,
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: order.currency.toLowerCase() === "bgn" ? "bgn" : order.currency.toLowerCase(),
        unit_amount: Math.round(item.unitPrice * 100),
        product_data: { name: item.productName },
      },
    })),
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${siteUrl}/checkout/success?order=${order.orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel?order=${order.orderNumber}`,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: session.id },
  });

  return session;
}

export async function createPayPalOrder(order: {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
}) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal не е конфигуриран.");

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
  if (!tokenData.access_token) throw new Error("PayPal auth failed");

  const currency = order.currency === "BGN" ? "EUR" : order.currency;
  // Note: PayPal may not support BGN — convert hint shown to user; store original amount
  const createRes = await fetch(`${base}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.id,
          description: `Order ${order.orderNumber}`,
          amount: {
            currency_code: currency,
            value: order.total.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd.",
        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/paypal/capture?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel?order=${order.orderNumber}`,
      },
    }),
  });

  const paypalOrder = await createRes.json();
  await prisma.order.update({
    where: { id: order.id },
    data: { paymentId: paypalOrder.id },
  });

  const approve = (paypalOrder.links || []).find(
    (l: { rel: string }) => l.rel === "approve"
  );
  return { paypalOrderId: paypalOrder.id, approveUrl: approve?.href as string };
}
