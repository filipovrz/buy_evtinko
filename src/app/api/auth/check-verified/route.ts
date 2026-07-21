import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Used by login UI when NextAuth masks custom authorize errors */
export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  if (!email) return NextResponse.json({ verified: true });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true, role: true, passwordHash: true },
  });
  if (!user?.passwordHash) return NextResponse.json({ verified: true });
  if (user.role === "ADMIN") return NextResponse.json({ verified: true });
  return NextResponse.json({ verified: !!user.emailVerified });
}
