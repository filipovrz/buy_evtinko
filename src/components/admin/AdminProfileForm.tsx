"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export function AdminProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const { t } = useI18n();
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setError("");
    const res = await fetch("/api/admin/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMsg(t.common.success);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
      <div>
        <label className="label">{t.admin.email}</label>
        <input className="input bg-ink-50" value={email} disabled />
      </div>
      <div>
        <label className="label">{t.admin.name}</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="label">{t.auth.currentPassword}</label>
        <input
          type="password"
          className="input"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="label">{t.admin.newPassword}</label>
        <input
          type="password"
          className="input"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-accent">{msg}</p>}
      <button type="submit" className="btn-primary">
        {t.admin.save}
      </button>
    </form>
  );
}
