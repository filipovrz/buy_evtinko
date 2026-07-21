import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { prisma } from "./prisma";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; path?: string; content?: Buffer; contentType?: string }[];
};

export async function getAdminNotifyEmail() {
  if (process.env.ADMIN_NOTIFY_EMAIL) return process.env.ADMIN_NOTIFY_EMAIL;
  const setting = await prisma.siteSetting.findUnique({ where: { key: "support_email" } });
  if (setting?.value) return setting.value;
  const admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPERADMIN", "ADMIN"] } },
    orderBy: { role: "desc" },
    select: { email: true },
  });
  return admin?.email || "admin@evtinko-bg.com";
}

export async function notifyAdmin(subject: string, html: string) {
  const to = await getAdminNotifyEmail();
  return sendMail({ to, subject, html });
}

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

/** Sends email via SMTP, or writes to data/mail-outbox when SMTP is not configured */
export async function sendMail(payload: MailPayload) {
  const from =
    process.env.SMTP_FROM ||
    `"${process.env.NEXT_PUBLIC_COMPANY_NAME || "Auctions Evtinko Ltd."}" <noreply@evtinko-bg.com>`;

  const transport = getTransport();
  if (transport) {
    await transport.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      attachments: payload.attachments,
    });
    return { mode: "smtp" as const };
  }

  const outbox = path.join(process.cwd(), "data", "mail-outbox");
  if (!fs.existsSync(outbox)) fs.mkdirSync(outbox, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(outbox, `${stamp}-${payload.to.replace(/[^a-z0-9@._-]/gi, "_")}.html`);
  fs.writeFileSync(
    file,
    `<!-- TO: ${payload.to} | SUBJECT: ${payload.subject} -->\n${payload.html}`,
    "utf8"
  );
  console.log(`[mail] SMTP not configured — saved to ${file}`);
  return { mode: "outbox" as const, file };
}
