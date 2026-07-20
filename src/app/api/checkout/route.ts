import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createOrderFromCheckout,
  createPayPalOrder,
  createStripeCheckoutSession,
  markOrderPaid,
  buildEpayPayload,
} from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const {
      items,
      paymentMethod,
      guestEmail,
      guestName,
      couponCode,
      invoiceCompany,
      invoiceBulstat,
      invoiceAddress,
    } = body;

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: "Количката е празна." }, { status: 400 });
    }

    const method = paymentMethod as "STRIPE" | "PAYPAL" | "EPAY" | "DEMO";
    if (!["STRIPE", "PAYPAL", "EPAY", "DEMO"].includes(method)) {
      return NextResponse.json({ error: "Невалиден метод на плащане." }, { status: 400 });
    }

    if (!session?.user && (!guestEmail || !guestName)) {
      return NextResponse.json(
        { error: "За гост поръчка са нужни име и имейл." },
        { status: 400 }
      );
    }

    if (method === "DEMO" && process.env.ENABLE_DEMO_PAYMENTS !== "true") {
      return NextResponse.json({ error: "Демо плащанията са изключени." }, { status: 400 });
    }

    const order = await createOrderFromCheckout({
      items,
      paymentMethod: method,
      guestEmail,
      guestName,
      userId: session?.user?.id,
      couponCode,
      invoiceCompany,
      invoiceBulstat,
      invoiceAddress,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (method === "DEMO") {
      await markOrderPaid(order.id, `demo_${Date.now()}`);
      return NextResponse.json({
        orderNumber: order.orderNumber,
        redirectUrl: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
      });
    }

    if (method === "STRIPE") {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json(
          { error: "Stripe не е конфигуриран. Свържете се с администратора." },
          { status: 503 }
        );
      }
      const stripeSession = await createStripeCheckoutSession({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        guestEmail: order.guestEmail,
        items: order.items,
      });
      return NextResponse.json({
        orderNumber: order.orderNumber,
        redirectUrl: stripeSession.url,
      });
    }

    if (method === "PAYPAL") {
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        return NextResponse.json(
          { error: "PayPal не е конфигуриран. Свържете се с администратора." },
          { status: 503 }
        );
      }
      const paypal = await createPayPalOrder({
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
      });
      return NextResponse.json({
        orderNumber: order.orderNumber,
        redirectUrl: paypal.approveUrl,
      });
    }

    if (method === "EPAY") {
      const min = process.env.EPAY_MIN;
      const secret = process.env.EPAY_SECRET;
      if (!min || !secret) {
        return NextResponse.json(
          { error: "ePay.bg не е конфигуриран. Свържете се с администратора." },
          { status: 503 }
        );
      }

      const exp = new Date();
      exp.setDate(exp.getDate() + 1);
      const expDate = `${String(exp.getDate()).padStart(2, "0")}.${String(exp.getMonth() + 1).padStart(2, "0")}.${exp.getFullYear()}`;

      const { encoded, checksum } = buildEpayPayload({
        min,
        invoice: order.orderNumber.replace(/\W/g, "").slice(0, 10),
        amount: order.total.toFixed(2),
        currency: order.currency,
        expDate,
        description: `Order ${order.orderNumber}`,
        secret,
      });

      // Store encoded invoice mapping
      await (await import("@/lib/prisma")).prisma.order.update({
        where: { id: order.id },
        data: { paymentId: encoded.slice(0, 64) },
      });

      const epayUrl = process.env.EPAY_URL || "https://www.epay.bg/";
      const params = new URLSearchParams({
        PAGE: "paylogin",
        ENCODED: encoded,
        CHECKSUM: checksum,
        URL_OK: `${siteUrl}/checkout/success?order=${order.orderNumber}`,
        URL_CANCEL: `${siteUrl}/checkout/cancel?order=${order.orderNumber}`,
      });

      return NextResponse.json({
        orderNumber: order.orderNumber,
        redirectUrl: `${epayUrl}?${params.toString()}`,
      });
    }

    return NextResponse.json({ error: "Неподдържан метод." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Грешка при checkout." },
      { status: 500 }
    );
  }
}
