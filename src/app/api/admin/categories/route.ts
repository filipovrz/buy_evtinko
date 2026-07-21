import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  if (!(await requirePermission("categories"))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const slug = slugify(body.name);
  const cat = await prisma.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      sortOrder: body.sortOrder || 0,
    },
  });
  return NextResponse.json(cat);
}
