import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    await prisma.contactMessage.create({ data: body });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Невалидни данни" }, { status: 400 });
  }
}
