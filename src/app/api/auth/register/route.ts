import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail, notifyAdmin } from "@/lib/mail";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "This email is already registered." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash,
        role: "CUSTOMER",
        emailVerified: null,
        locale: "en",
      },
    });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd.";
    const verifyUrl = `${site}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: `Confirm your email — ${company}`,
      html: `<p>Hello ${data.name},</p><p>Please confirm your email to activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Link valid for 24 hours.</p>`,
    });

    await notifyAdmin(
      `New registration — ${email}`,
      `<p>New customer registered:</p><ul><li>Name: ${data.name}</li><li>Email: ${email}</li></ul><p>Waiting for email verification.</p>`
    );

    return NextResponse.json({ ok: true, needsVerification: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
