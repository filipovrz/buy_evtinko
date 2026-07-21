import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getServerDictionary } from "@/i18n/server";
import { guardAdminPage } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.settings} — Admin` };
}

export default async function AdminSettingsPage() {
  await guardAdminPage("settings");
  const { t } = await getServerDictionary();
  const settings = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.settings}</h1>
      <p className="mt-1 text-sm text-ink-500">{t.admin.settingsHint}</p>
      <div className="mt-8">
        <SettingsForm initial={map} />
      </div>
    </div>
  );
}
