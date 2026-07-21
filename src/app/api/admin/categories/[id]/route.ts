import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const cat = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug: body.slug ? slugify(String(body.slug)) : slugify(name),
      description: body.description || null,
      sortOrder: Number(body.sortOrder) || 0,
    },
  });
  return NextResponse.json(cat);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
