import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!token || !email) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.identifier !== email || record.expires < new Date()) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const company = process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd.";
  await sendMail({
    to: email,
    subject: `Welcome — ${company}`,
    html: `<p>Your email is confirmed. You can now sign in and shop on buy-software.evtinko-bg.com.</p>`,
  });

  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  const token = String(body.token || "");
  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  if (!token || !email) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const url = new URL(req.url);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);
  return GET(new Request(url.toString()));
}
