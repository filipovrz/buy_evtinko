"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/use-i18n";
import {
  ADMIN_PERMISSIONS,
  PERMISSION_META,
  parsePermissions,
  type AdminPermission,
} from "@/lib/permissions";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  company: string | null;
  permissions: string | null;
  emailVerified: Date | string | null;
  createdAt: Date | string;
  _count: { orders: number };
};

export function UsersManager({
  initial,
  isSuperAdmin,
}: {
  initial: UserRow[];
  isSuperAdmin: boolean;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const [perms, setPerms] = useState<AdminPermission[]>(["dashboard", "products", "orders"]);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [editPerms, setEditPerms] = useState<AdminPermission[]>([]);
  const [error, setError] = useState("");

  const permLabel = useMemo(
    () => (key: AdminPermission) =>
      locale === "bg" ? PERMISSION_META[key].labelBg : PERMISSION_META[key].labelEn,
    [locale]
  );

  function togglePerm(list: AdminPermission[], key: AdminPermission, on: boolean) {
    return on ? [...list, key] : list.filter((p) => p !== key);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        permissions: role === "ADMIN" ? perms : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setName("");
    setEmail("");
    setPassword("");
    setRole("CUSTOMER");
    router.refresh();
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    const res = await fetch(`/api/admin/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        role: editing.role === "SUPERADMIN" ? "SUPERADMIN" : editing.role,
        company: editing.company,
        password: editPassword || undefined,
        emailVerified: !!editing.emailVerified,
        permissions: editing.role === "ADMIN" ? editPerms : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setEditing(null);
    setEditPassword("");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.admin.confirmDelete)) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || t.common.error);
      return;
    }
    router.refresh();
  }

  function startEdit(u: UserRow) {
    setEditing(u);
    setEditPerms(parsePermissions(u.permissions));
    setEditPassword("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-ink-100 bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input className="input" placeholder={t.admin.name} value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className="input"
            type="email"
            required
            placeholder={t.admin.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            required
            minLength={8}
            placeholder={t.admin.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value as "CUSTOMER" | "ADMIN")}
            disabled={!isSuperAdmin && role === "ADMIN"}
          >
            <option value="CUSTOMER">CUSTOMER</option>
            {isSuperAdmin && <option value="ADMIN">ADMIN</option>}
          </select>
        </div>

        {isSuperAdmin && role === "ADMIN" && (
          <fieldset className="rounded-xl border border-ink-100 p-3">
            <legend className="px-1 text-sm font-medium text-ink-700">{t.admin.permissions}</legend>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ADMIN_PERMISSIONS.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={perms.includes(key)}
                    onChange={(e) => setPerms(togglePerm(perms, key, e.target.checked))}
                  />
                  {permLabel(key)}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button type="submit" className="btn-primary">
          {t.admin.add}
        </button>
      </form>

      {editing && (
        <form onSubmit={onSave} className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="input"
              value={editing.name || ""}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder={t.admin.name}
            />
            {editing.role !== "SUPERADMIN" && isSuperAdmin ? (
              <select
                className="input"
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              >
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            ) : (
              <input className="input bg-ink-50" value={editing.role} disabled />
            )}
            <input
              className="input"
              type="password"
              minLength={8}
              placeholder={t.admin.newPassword}
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />
          </div>

          {isSuperAdmin && editing.role === "ADMIN" && (
            <fieldset className="rounded-xl border border-brand-100 bg-white p-3">
              <legend className="px-1 text-sm font-medium">{t.admin.permissions}</legend>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ADMIN_PERMISSIONS.map((key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editPerms.includes(key)}
                      onChange={(e) => setEditPerms(togglePerm(editPerms, key, e.target.checked))}
                    />
                    {permLabel(key)}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="flex gap-2">
            <button type="submit" className="btn-primary">
              {t.admin.save}
            </button>
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
              {t.common.cancel}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t.admin.name}</th>
              <th className="px-4 py-3 font-medium">{t.admin.email}</th>
              <th className="px-4 py-3 font-medium">{t.admin.role}</th>
              <th className="px-4 py-3 font-medium">{t.admin.permissions}</th>
              <th className="px-4 py-3 font-medium">{t.account.orders}</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {initial.map((u) => {
              const plist = parsePermissions(u.permissions);
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">{u.name || "—"}</td>
                  <td className="px-4 py-3">
                    {u.email}
                    {!u.emailVerified && <span className="ml-2 text-xs text-amber-600">unverified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        u.role === "SUPERADMIN"
                          ? "font-semibold text-accent"
                          : u.role === "ADMIN"
                            ? "font-semibold text-brand-700"
                            : ""
                      }
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">
                    {u.role === "SUPERADMIN"
                      ? t.admin.allPermissions
                      : u.role === "ADMIN"
                        ? plist.map(permLabel).join(", ") || "—"
                        : "—"}
                  </td>
                  <td className="px-4 py-3">{u._count.orders}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3">
                      {(isSuperAdmin || u.role === "CUSTOMER") && (
                        <button type="button" className="text-brand-600" onClick={() => startEdit(u)}>
                          {t.admin.edit}
                        </button>
                      )}
                      {u.role !== "SUPERADMIN" && (isSuperAdmin || u.role === "CUSTOMER") && (
                        <button type="button" className="text-red-600" onClick={() => onDelete(u.id)}>
                          {t.admin.delete}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {initial.length === 0 && <p className="p-8 text-center text-ink-500">{t.admin.noUsers}</p>}
      </div>
    </div>
  );
}
