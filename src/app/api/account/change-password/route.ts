import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Акаунтът няма парола (социален вход). Задайте парола чрез „Забравена парола“." },
        { status: 400 }
      );
    }
    const ok = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Грешна текуща парола." }, { status: 400 });

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Невалидни данни." }, { status: 400 });
  }
}
