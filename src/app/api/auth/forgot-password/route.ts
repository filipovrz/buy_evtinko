import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const { email } = schema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return OK to avoid email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });
      const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const link = `${site}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: "Password reset / Нуулиране на парола — Auctions Evtinko Ltd.",
        html: `<p>Здравейте,</p><p>За да зададете нова парола, отворете:</p><p><a href="${link}">${link}</a></p><p>Линкът е валиден 1 час.</p><p>Auctions Evtinko Ltd.</p>`,
        text: `Reset link: ${link}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
