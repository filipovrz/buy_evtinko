import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Няма файл." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const safeName = `${id}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fullPath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(fullPath, buffer);

  const updated = await prisma.product.update({
    where: { id },
    data: {
      fileName: file.name,
      filePath: safeName,
      fileSize: buffer.length,
      mimeType: file.type || "application/octet-stream",
    },
  });

  return NextResponse.json(updated);
}
