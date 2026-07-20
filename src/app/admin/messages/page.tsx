import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Съобщения — Админ" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  // mark all read
  await prisma.contactMessage.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Съобщения</h1>
      <div className="mt-8 space-y-3">
        {messages.map((m) => (
          <article key={m.id} className="rounded-xl border border-ink-100 bg-white p-5">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold">{m.subject}</p>
              <p className="text-xs text-ink-400">
                {new Date(m.createdAt).toLocaleString("bg-BG")}
              </p>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {m.name} · {m.email}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm text-ink-700">{m.message}</p>
          </article>
        ))}
        {messages.length === 0 && <p className="text-ink-500">Няма съобщения.</p>}
      </div>
    </div>
  );
}
