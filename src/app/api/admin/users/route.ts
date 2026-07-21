import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  const name = String(body.name || "").trim();
  const password = String(body.password || "");
  const role = body.role === "ADMIN" ? "ADMIN" : "CUSTOMER";

  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8) required" }, { status: 400 });
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
    },
  });

  await sendMail({
    to: email,
    subject: "Your account — Auctions Evtinko Ltd.",
    html: `<p>Hello ${name || ""},</p><p>An account was created for you on buy-software.evtinko-bg.com.</p><p>Email: ${email}</p><p>Sign in and change your password if needed.</p>`,
  });

  return NextResponse.json({ id: user.id, email: user.email });
}
