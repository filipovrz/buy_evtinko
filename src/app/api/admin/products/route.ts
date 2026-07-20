import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const body = await req.json();
    if (!body.name || !body.shortDesc || !body.description || body.price == null) {
      return NextResponse.json({ error: "Липсват задължителни полета." }, { status: 400 });
    }
    let slug = (body.slug || slugify(body.name)).trim();
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36)}`;

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        shortDesc: body.shortDesc,
        description: body.description,
        price: Number(body.price),
        compareAtPrice: body.compareAtPrice != null ? Number(body.compareAtPrice) : null,
        currency: body.currency || "EUR",
        type: body.type || "SOFTWARE",
        platform: body.platform || null,
        version: body.version || null,
        licenseType: body.licenseType || "SINGLE",
        downloadLimit: Number(body.downloadLimit) || 5,
        categoryId: body.categoryId || null,
        features: Array.isArray(body.features) ? JSON.stringify(body.features) : null,
        requirements: body.requirements || null,
        coverImage: body.coverImage || null,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
      },
    });
    return NextResponse.json(product);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Грешка при създаване." }, { status: 500 });
  }
}
