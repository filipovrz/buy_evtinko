import { NextResponse } from "next/server";
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
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.subject !== undefined) data.subject = String(body.subject).trim();
  if (body.message !== undefined) data.message = String(body.message).trim();
  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.isRead !== undefined) data.isRead = !!body.isRead;

  const msg = await prisma.contactMessage.update({ where: { id }, data });
  return NextResponse.json(msg);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.contactMessage.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
