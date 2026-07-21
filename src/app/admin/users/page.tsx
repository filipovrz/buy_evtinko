import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/i18n/server";
import { UsersManager } from "@/components/admin/UsersManager";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.users} — Admin` };
}

export default async function AdminUsersPage() {
  const { t } = await getServerDictionary();
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

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.users}</h1>
      <div className="mt-8">
        <UsersManager initial={users} />
      </div>
    </div>
  );
}
