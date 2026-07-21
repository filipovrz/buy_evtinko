import { redirect } from "next/navigation";
import { requireAdmin, sessionHasPermission } from "@/lib/auth";
import {
  ADMIN_PERMISSIONS,
  PERMISSION_META,
  type AdminPermission,
} from "@/lib/permissions";

export async function guardAdminPage(permission: AdminPermission | null = null) {
  const session = await requireAdmin();
  if (!session) redirect("/login?callbackUrl=/admin");
  if (permission && !sessionHasPermission(session, permission)) {
    const first = ADMIN_PERMISSIONS.find((p) => sessionHasPermission(session, p));
    redirect(first ? PERMISSION_META[first].href : "/admin/profile");
  }
  return session;
}
