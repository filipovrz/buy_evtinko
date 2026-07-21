import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTotpSecret, getTotpUri, verifyTotpCode } from "@/lib/totp";
import QRCode from "qrcode";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return NextResponse.json({
    enabled: !!user?.totpEnabled,
    hasSecret: !!user?.totpSecret,
  });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const action = body.action as string;
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "setup") {
    const secret = createTotpSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: secret, totpEnabled: false },
    });
    const otpauth = getTotpUri(user.email, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    return NextResponse.json({ secret, qrDataUrl });
  }

  if (action === "enable") {
    if (!user.totpSecret) return NextResponse.json({ error: "Няма secret" }, { status: 400 });
    if (!verifyTotpCode(String(body.code || ""), user.totpSecret)) {
      return NextResponse.json({ error: "Грешен код" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    });
    return NextResponse.json({ ok: true, enabled: true });
  }

  if (action === "disable") {
    if (user.totpEnabled && user.totpSecret) {
      if (!verifyTotpCode(String(body.code || ""), user.totpSecret)) {
        return NextResponse.json({ error: "Грешен код" }, { status: 400 });
      }
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: false, totpSecret: null },
    });
    return NextResponse.json({ ok: true, enabled: false });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
