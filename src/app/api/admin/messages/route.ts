import { NextResponse } from "next/server";
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
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const type = body.type === "PERSONAL" ? "PERSONAL" : "GENERAL";
  const subject = String(body.subject || "").trim();
  const message = String(body.message || "").trim();
  const name = String(body.name || "Admin").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message required" }, { status: 400 });
  }

  let targetUserId: string | null = null;
  let email = "admin@evtinko-bg.com";

  if (type === "PERSONAL") {
    const targetEmail = String(body.targetEmail || "")
      .toLowerCase()
      .trim();
    if (!targetEmail) {
      return NextResponse.json({ error: "Target user email required" }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { email: targetEmail } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    targetUserId = user.id;
    email = user.email;

    await sendMail({
      to: user.email,
      subject: `[Auctions Evtinko] ${subject}`,
      html: `<p>Hello ${user.name || ""},</p><p>${message.replace(/\n/g, "<br/>")}</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account">Open your account</a></p>`,
    });
  } else {
    // GENERAL — notify all customers with verified email
    const users = await prisma.user.findMany({
      where: { role: "CUSTOMER", emailVerified: { not: null } },
      select: { email: true, name: true },
    });
    email = "all-customers";
    await Promise.all(
      users.map((u) =>
        sendMail({
          to: u.email,
          subject: `[Auctions Evtinko] ${subject}`,
          html: `<p>Hello ${u.name || ""},</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
        })
      )
    );
  }

  const created = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
      type,
      targetUserId,
      isRead: true,
    },
  });

  return NextResponse.json(created);
}
