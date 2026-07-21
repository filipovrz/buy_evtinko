"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/use-i18n";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  company: string | null;
  emailVerified: Date | string | null;
  createdAt: Date | string;
  _count: { orders: number };
};

export function UsersManager({ initial }: { initial: UserRow[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CUSTOMER");
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [error, setError] = useState("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
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
        role: editing.role,
        company: editing.company,
        password: editPassword || undefined,
        emailVerified: !!editing.emailVerified,
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

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 md:grid-cols-5">
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
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button type="submit" className="btn-primary">
          {t.admin.add}
        </button>
      </form>

      {editing && (
        <form onSubmit={onSave} className="grid gap-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4 md:grid-cols-4">
          <input
            className="input"
            value={editing.name || ""}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            placeholder={t.admin.name}
          />
          <select
            className="input"
            value={editing.role}
            onChange={(e) => setEditing({ ...editing, role: e.target.value })}
          >
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input
            className="input"
            type="password"
            minLength={8}
            placeholder={t.admin.newPassword}
            value={editPassword}
            onChange={(e) => setEditPassword(e.target.value)}
          />
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
              <th className="px-4 py-3 font-medium">{t.account.orders}</th>
              <th className="px-4 py-3 font-medium">{t.admin.registered}</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {initial.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">{u.name || "—"}</td>
                <td className="px-4 py-3">
                  {u.email}
                  {!u.emailVerified && <span className="ml-2 text-xs text-amber-600">unverified</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={u.role === "ADMIN" ? "font-semibold text-accent" : ""}>{u.role}</span>
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(u.createdAt).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" className="text-brand-600" onClick={() => setEditing(u)}>
                      {t.admin.edit}
                    </button>
                    <button type="button" className="text-red-600" onClick={() => onDelete(u.id)}>
                      {t.admin.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {initial.length === 0 && <p className="p-8 text-center text-ink-500">{t.admin.noUsers}</p>}
      </div>
    </div>
  );
}
