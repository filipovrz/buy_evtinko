import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/i18n/server";
import { AdminProfileForm } from "@/components/admin/AdminProfileForm";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.profile} — Admin` };
}

export default async function AdminProfilePage() {
  const session = await requireAdmin();
  if (!session) redirect("/login");
  const { t } = await getServerDictionary();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.profile}</h1>
      <p className="mt-1 text-sm text-ink-500">{t.admin.profileHint}</p>
      <div className="mt-8">
        <AdminProfileForm initialName={user.name || ""} email={user.email} />
      </div>
    </div>
  );
}
