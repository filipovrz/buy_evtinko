import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/i18n/server";
import { UsersManager } from "@/components/admin/UsersManager";
import { guardAdminPage } from "@/lib/admin-guard";
import { isSuperAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.users} — Admin` };
}

export default async function AdminUsersPage() {
  const session = await guardAdminPage("users");
  // Superadmin without users key still allowed via layout — ensure access:
  // guardAdminPage("users") already allows SUPERADMIN via hasPermission

  const { t } = await getServerDictionary();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      permissions: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.users}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {isSuperAdmin(session.user.role) ? t.admin.usersSuperHint : t.admin.usersHint}
      </p>
      <div className="mt-8">
        <UsersManager initial={users} isSuperAdmin={isSuperAdmin(session.user.role)} />
      </div>
    </div>
  );
}
