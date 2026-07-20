import { prisma } from "./prisma";
import { sendMail } from "./mail";
import { generateInvoicePdf } from "./invoice";
import { formatPrice } from "./utils";

export async function sendOrderPaidEmail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      downloads: true,
      user: true,
    },
  });
  if (!order || order.status !== "PAID") return;

  const email = order.guestEmail || order.user?.email;
  if (!email) return;

  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd.";

  let invoicePath: string | undefined;
  try {
    const inv = await generateInvoicePdf(order.id);
    invoicePath = inv.filePath;
  } catch (e) {
    console.error("Invoice PDF failed", e);
  }

  const downloadRows = order.downloads
    .map((d) => {
      const item = order.items.find((i) => i.productId === d.productId);
      return `<li><strong>${item?.productName || "Product"}</strong> — <a href="${site}/api/download/${d.token}">Download</a>${
        item?.licenseKey ? ` · License: ${item.licenseKey}` : ""
      }</li>`;
    })
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      <h1 style="color:#1a55f5">${company}</h1>
      <p>Thank you for your purchase / Благодарим за покупката!</p>
      <p><strong>Order / Поръчка:</strong> ${order.orderNumber}<br/>
      <strong>Total / Общо:</strong> ${formatPrice(order.total, order.currency)}</p>
      <h2>Downloads / Изтегляния</h2>
      <ul>${downloadRows}</ul>
      <p><a href="${site}/checkout/success?order=${order.orderNumber}">View order</a>
      ${order.userId ? ` · <a href="${site}/account/orders">My account</a>` : ""}
      · <a href="${site}/api/invoice/${order.id}">Invoice PDF</a></p>
      <hr/>
      <p style="font-size:12px;color:#666">buy-software.evtinko-bg.com · ${company}</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `[${company}] Order ${order.orderNumber} — downloads ready`,
    html,
    text: `Order ${order.orderNumber} paid. Open ${site}/checkout/success?order=${order.orderNumber}`,
    attachments: invoicePath
      ? [{ filename: `${order.invoiceNumber || order.orderNumber}.pdf`, path: invoicePath, contentType: "application/pdf" }]
      : undefined,
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { emailSentAt: new Date() },
  });
}
