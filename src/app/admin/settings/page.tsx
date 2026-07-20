import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Настройки — Админ" };

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Настройки</h1>
      <p className="mt-1 text-sm text-ink-500">
        Платежните ключове се задават в `.env` на сървъра (виж README).
      </p>
      <div className="mt-8">
        <SettingsForm initial={map} />
      </div>
    </div>
  );
}
