/** Admin panel permission keys (assigned by SUPERADMIN to ADMIN users). */

export const ADMIN_PERMISSIONS = [
  "dashboard",
  "analytics",
  "products",
  "orders",
  "categories",
  "coupons",
  "users",
  "messages",
  "settings",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const PERMISSION_META: Record<
  AdminPermission,
  { labelEn: string; labelBg: string; href: string }
> = {
  dashboard: { labelEn: "Dashboard", labelBg: "Табло", href: "/admin" },
  analytics: { labelEn: "Analytics", labelBg: "Статистики", href: "/admin/analytics" },
  products: { labelEn: "Products", labelBg: "Продукти", href: "/admin/products" },
  orders: { labelEn: "Orders", labelBg: "Поръчки", href: "/admin/orders" },
  categories: { labelEn: "Categories", labelBg: "Категории", href: "/admin/categories" },
  coupons: { labelEn: "Promo codes", labelBg: "Промо кодове", href: "/admin/coupons" },
  users: { labelEn: "Users (customers)", labelBg: "Потребители", href: "/admin/users" },
  messages: { labelEn: "Messages", labelBg: "Съобщения", href: "/admin/messages" },
  settings: { labelEn: "Site settings", labelBg: "Настройки", href: "/admin/settings" },
};

export type StaffRole = "ADMIN" | "SUPERADMIN";

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export function isSuperAdmin(role: string | null | undefined): boolean {
  return role === "SUPERADMIN";
}

export function parsePermissions(raw: string | null | undefined): AdminPermission[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is AdminPermission =>
      ADMIN_PERMISSIONS.includes(p as AdminPermission)
    );
  } catch {
    return [];
  }
}

export function serializePermissions(perms: AdminPermission[]): string {
  const unique = Array.from(new Set(perms.filter((p) => ADMIN_PERMISSIONS.includes(p))));
  return JSON.stringify(unique);
}

export function normalizePermissionsInput(input: unknown): AdminPermission[] {
  if (!Array.isArray(input)) return [];
  return input.filter((p): p is AdminPermission =>
    ADMIN_PERMISSIONS.includes(p as AdminPermission)
  );
}

export function hasPermission(
  role: string | null | undefined,
  permissions: AdminPermission[] | string | null | undefined,
  key: AdminPermission
): boolean {
  if (role === "SUPERADMIN") return true;
  if (role !== "ADMIN") return false;
  const list = typeof permissions === "string" ? parsePermissions(permissions) : permissions || [];
  return list.includes(key);
}

/** Map admin path prefix → required permission (null = any staff). */
export function permissionForPath(pathname: string): AdminPermission | null {
  if (pathname === "/admin" || pathname === "/admin/") return "dashboard";
  if (pathname.startsWith("/admin/analytics")) return "analytics";
  if (pathname.startsWith("/admin/products")) return "products";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/coupons")) return "coupons";
  if (pathname.startsWith("/admin/users")) return "users";
  if (pathname.startsWith("/admin/messages")) return "messages";
  if (pathname.startsWith("/admin/settings")) return "settings";
  if (pathname.startsWith("/admin/profile") || pathname.startsWith("/admin/2fa")) return null;
  return "dashboard";
}
