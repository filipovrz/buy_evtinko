import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: Request, ctx: Ctx) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {
    name: body.name ?? null,
    role: body.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    company: body.company || null,
  };
  if (body.password && String(body.password).length >= 8) {
    data.passwordHash = await bcrypt.hash(String(body.password), 12);
  }
  if (body.emailVerified === true) data.emailVerified = new Date();
  if (body.emailVerified === false) data.emailVerified = null;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await assertAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
