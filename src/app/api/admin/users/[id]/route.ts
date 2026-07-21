import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requirePermission, requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isStaffRole,
  isSuperAdmin,
  normalizePermissionsInput,
  serializePermissions,
} from "@/lib/permissions";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json();
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const promotingOrEditingAdmin =
    body.role === "ADMIN" ||
    body.role === "SUPERADMIN" ||
    isStaffRole(target.role) ||
    Array.isArray(body.permissions);

  let actor;
  if (promotingOrEditingAdmin || target.role === "SUPERADMIN") {
    actor = await requireSuperAdmin();
    if (!actor) return NextResponse.json({ error: "Only superadmin can manage staff" }, { status: 403 });
  } else {
    actor = await requirePermission("users");
    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (target.role === "SUPERADMIN" && target.id !== actor.user.id) {
    return NextResponse.json({ error: "Cannot modify another superadmin" }, { status: 403 });
  }

  // Never allow creating/assigning SUPERADMIN via API
  let role = target.role;
  if (body.role === "ADMIN") role = "ADMIN";
  else if (body.role === "CUSTOMER") role = "CUSTOMER";
  if (target.role === "SUPERADMIN") role = "SUPERADMIN";

  const data: Record<string, unknown> = {
    name: body.name ?? target.name,
    company: body.company !== undefined ? body.company || null : target.company,
  };

  if (role !== target.role && target.role !== "SUPERADMIN") {
    data.role = role;
  }

  if (role === "ADMIN") {
    const permissions = normalizePermissionsInput(body.permissions);
    if (permissions.length === 0) {
      return NextResponse.json({ error: "Admin needs at least one permission" }, { status: 400 });
    }
    data.permissions = serializePermissions(permissions);
  } else if (role === "CUSTOMER") {
    data.permissions = null;
  }

  if (body.password && String(body.password).length >= 8) {
    data.passwordHash = await bcrypt.hash(String(body.password), 12);
  }
  if (body.emailVerified === true) data.emailVerified = new Date();
  if (body.emailVerified === false && !isStaffRole(role)) data.emailVerified = null;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, permissions: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let actor;
  if (isStaffRole(target.role)) {
    actor = await requireSuperAdmin();
    if (!actor) return NextResponse.json({ error: "Only superadmin can delete staff" }, { status: 403 });
  } else {
    actor = await requirePermission("users");
    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (id === actor.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }
  if (isSuperAdmin(target.role)) {
    return NextResponse.json({ error: "Cannot delete superadmin" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
