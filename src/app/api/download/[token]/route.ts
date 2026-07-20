import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type Ctx = { params: Promise<{ token: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { token } = await ctx.params;
  const download = await prisma.download.findUnique({ where: { token } });
  if (!download) {
    return NextResponse.json({ error: "Невалиден линк." }, { status: 404 });
  }

  if (download.expiresAt < new Date()) {
    return NextResponse.json({ error: "Линкът е изтекъл." }, { status: 410 });
  }

  if (download.downloadCount >= download.maxDownloads) {
    return NextResponse.json({ error: "Достигнат е лимитът за изтегляния." }, { status: 403 });
  }

  const order = await prisma.order.findUnique({ where: { id: download.orderId } });
  if (!order || order.status !== "PAID") {
    return NextResponse.json({ error: "Поръчката не е платена." }, { status: 403 });
  }

  const product = await prisma.product.findUnique({ where: { id: download.productId } });
  if (!product) {
    return NextResponse.json({ error: "Продуктът липсва." }, { status: 404 });
  }

  await prisma.download.update({
    where: { id: download.id },
    data: {
      downloadCount: { increment: 1 },
      lastDownloadAt: new Date(),
    },
  });

  if (product.filePath) {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const fullPath = path.isAbsolute(product.filePath)
      ? product.filePath
      : path.join(process.cwd(), uploadDir, path.basename(product.filePath));

    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": product.mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${product.fileName || path.basename(fullPath)}"`,
          "Content-Length": String(buffer.length),
        },
      });
    }
  }

  // Fallback demo file when no upload yet
  const content = [
    `Auctions Evtinko Ltd. — Buy Software`,
    `=====================================`,
    `Продукт: ${product.name}`,
    `Версия: ${product.version || "—"}`,
    `Поръчка: ${order.orderNumber}`,
    `Дата: ${new Date().toISOString()}`,
    ``,
    `Това е демо файл. Качете реалния пакет от админ панела.`,
    `Домейн: buy-software.evtinko-bg.com`,
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${product.slug}-license.txt"`,
    },
  });
}
