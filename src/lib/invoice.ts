import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";
import { formatPrice } from "./utils";

export async function generateInvoicePdf(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });
  if (!order) throw new Error("Order not found");

  const invoicesDir = path.join(process.cwd(), "uploads", "invoices");
  if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

  const invoiceNumber =
    order.invoiceNumber ||
    `INV-${order.orderNumber.replace(/\W/g, "").slice(-10)}`;
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoicesDir, fileName);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd.";
    doc.fontSize(18).text(company, { align: "left" });
    doc.fontSize(10).fillColor("#555").text("buy-software.evtinko-bg.com");
    doc.moveDown();
    doc.fillColor("#000").fontSize(16).text("INVOICE / ФАКТУРА");
    doc.fontSize(11).text(`No: ${invoiceNumber}`);
    doc.text(`Order: ${order.orderNumber}`);
    doc.text(`Date: ${(order.paidAt || order.createdAt).toISOString().slice(0, 10)}`);
    doc.moveDown();

    const buyer =
      order.invoiceCompany ||
      order.guestName ||
      order.user?.name ||
      order.guestEmail ||
      order.user?.email ||
      "Customer";
    doc.text(`Bill to / Получател: ${buyer}`);
    if (order.invoiceBulstat) doc.text(`EIK/BULSTAT: ${order.invoiceBulstat}`);
    if (order.invoiceAddress) doc.text(`Address: ${order.invoiceAddress}`);
    if (order.guestEmail || order.user?.email) {
      doc.text(`Email: ${order.guestEmail || order.user?.email}`);
    }
    doc.moveDown();

    doc.fontSize(11).text("Items / Артикули:", { underline: true });
    doc.moveDown(0.5);
    for (const item of order.items) {
      doc.text(
        `${item.productName}  x${item.quantity}  —  ${formatPrice(item.unitPrice * item.quantity, order.currency)}`
      );
      if (item.licenseKey) doc.fontSize(9).fillColor("#666").text(`  License: ${item.licenseKey}`);
      doc.fillColor("#000").fontSize(11);
    }

    doc.moveDown();
    doc.fontSize(12).text(`Subtotal: ${formatPrice(order.subtotal, order.currency)}`);
    doc.fontSize(14).text(`TOTAL: ${formatPrice(order.total, order.currency)}`, { underline: true });
    doc.moveDown();
    doc.fontSize(9).fillColor("#666").text("Payment method: " + (order.paymentMethod || "—"));
    doc.text("Thank you for your purchase. / Благодарим за покупката.");
    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      invoiceNumber,
      invoicePath: path.join("invoices", fileName),
    },
  });

  return { invoiceNumber, filePath, relativePath: path.join("invoices", fileName) };
}
