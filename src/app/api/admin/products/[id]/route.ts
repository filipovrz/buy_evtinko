import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();

  let slug = (body.slug || slugify(body.name || "product")).trim();
  const clash = await prisma.product.findFirst({
    where: { slug, NOT: { id } },
  });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const product = await prisma.product.update({
    where: { id },
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
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
