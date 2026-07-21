import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requirePermission, requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { normalizePermissionsInput, serializePermissions } from "@/lib/permissions";

export async function GET() {
  const actor = await requirePermission("users");
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      permissions: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return NextResponse.json({ users, isSuperAdmin: actor.user.role === "SUPERADMIN" });
}

export async function POST(req: Request) {
  const body = await req.json();
  const wantAdmin = body.role === "ADMIN";

  if (wantAdmin) {
    const superSession = await requireSuperAdmin();
    if (!superSession) return NextResponse.json({ error: "Only superadmin can create admins" }, { status: 403 });
  } else {
    const session = await requirePermission("users");
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const role = wantAdmin ? "ADMIN" : "CUSTOMER";
  const permissions = wantAdmin ? normalizePermissionsInput(body.permissions) : [];

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8) required" }, { status: 400 });
  }
  if (wantAdmin && permissions.length === 0) {
    return NextResponse.json({ error: "Select at least one permission for admin" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already used" }, { status: 400 });

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      role,
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: new Date(),
      locale: "en",
      permissions: wantAdmin ? serializePermissions(permissions) : null,
    },
  });

  await sendMail({
    to: email,
    subject: wantAdmin
      ? "Admin access — Auctions Evtinko Ltd."
      : "Your account — Auctions Evtinko Ltd.",
    html: wantAdmin
      ? `<p>Hello ${name || ""},</p><p>You were granted admin access on buy-software.evtinko-bg.com.</p><p>Email: ${email}</p><p>Permissions: ${permissions.join(", ")}</p>`
      : `<p>Hello ${name || ""},</p><p>An account was created for you on buy-software.evtinko-bg.com.</p><p>Email: ${email}</p>`,
  });

  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
