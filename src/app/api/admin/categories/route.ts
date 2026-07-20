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

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
