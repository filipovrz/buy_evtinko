import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encodeEpayChecksum, markOrderPaid } from "@/lib/payments";

/**
 * ePay.bg notifies via POST with encoded + checksum.
 * Docs: https://www.epay.bg/
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const encoded = String(form.get("encoded") || "");
    const checksum = String(form.get("checksum") || "");
    const secret = process.env.EPAY_SECRET;

    if (!secret || !encoded || !checksum) {
      return new NextResponse("ERR=1\n", { status: 400 });
    }

    const expected = encodeEpayChecksum(encoded, secret);
    if (expected.toLowerCase() !== checksum.toLowerCase()) {
      return new NextResponse("ERR=1\n", { status: 400 });
    }

    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const lines = Object.fromEntries(
      decoded.split("\n").map((line) => {
        const [k, ...rest] = line.split("=");
        return [k, rest.join("=")];
      })
    );

    const invoice = lines.INVOICE;
    const status = lines.STATUS; // PAID, DENIED, EXPIRED

    const order =
      (await prisma.order.findFirst({
        where: { orderNumber: { contains: invoice || "___" } },
      })) ||
      (await prisma.order.findFirst({
        where: { paymentId: { contains: encoded.slice(0, 32) } },
      }));

    // Prefer exact match by reconstructing from order number digits
    const allPending = await prisma.order.findMany({
      where: { paymentMethod: "EPAY", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const matched =
      allPending.find(
        (o) => o.orderNumber.replace(/\W/g, "").slice(0, 10) === invoice
      ) || order;

    if (matched && status === "PAID") {
      await markOrderPaid(matched.id, invoice);
      return new NextResponse("INVOICE=" + invoice + ":STATUS=OK\n");
    }

    if (matched && (status === "DENIED" || status === "EXPIRED")) {
      await prisma.order.update({
        where: { id: matched.id },
        data: { status: "FAILED", paymentStatus: status },
      });
      return new NextResponse("INVOICE=" + invoice + ":STATUS=OK\n");
    }

    return new NextResponse("ERR=1\n", { status: 400 });
  } catch (e) {
    console.error(e);
    return new NextResponse("ERR=1\n", { status: 500 });
  }
}
