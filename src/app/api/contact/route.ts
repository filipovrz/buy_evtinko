import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/mail";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(2),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    await prisma.contactMessage.create({
      data: { ...body, type: "INBOUND" },
    });
    await notifyAdmin(
      `Contact: ${body.subject}`,
      `<p><strong>${body.name}</strong> (${body.email})</p><p>${body.subject}</p><p>${body.message.replace(/\n/g, "<br/>")}</p>`
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
