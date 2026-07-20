import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const { token, password } = schema.parse(await req.json());
    const row = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return NextResponse.json({ error: "Невалиден или изтекъл линк." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Невалидни данни." }, { status: 400 });
  }
}
