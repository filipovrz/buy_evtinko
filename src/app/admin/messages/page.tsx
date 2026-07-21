import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/i18n/server";
import { MessagesManager } from "@/components/admin/MessagesManager";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.messages} — Admin` };
}

export default async function AdminMessagesPage() {
  const { t } = await getServerDictionary();
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  await prisma.contactMessage.updateMany({
    where: { isRead: false, type: "INBOUND" },
    data: { isRead: true },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.messages}</h1>
      <div className="mt-8">
        <MessagesManager initial={messages} />
      </div>
    </div>
  );
}
