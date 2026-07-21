import { guardAdminPage } from "@/lib/admin-guard";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await guardAdminPage("analytics");
  return <AnalyticsPanel />;
}
