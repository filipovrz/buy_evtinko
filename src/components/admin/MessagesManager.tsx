"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/use-i18n";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  targetUserId: string | null;
  createdAt: Date | string;
};

export function MessagesManager({ initial }: { initial: Msg[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [type, setType] = useState<"GENERAL" | "PERSONAL">("GENERAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [editing, setEditing] = useState<Msg | null>(null);
  const [error, setError] = useState("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, subject, message, targetEmail, name: "Admin" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setSubject("");
    setMessage("");
    setTargetEmail("");
    router.refresh();
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError("");
    const res = await fetch(`/api/admin/messages/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: editing.subject,
        message: editing.message,
        name: editing.name,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.admin.confirmDelete)) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  function typeLabel(ty: string) {
    if (ty === "GENERAL") return t.admin.generalNotice;
    if (ty === "PERSONAL") return t.admin.personal;
    return t.admin.inbound;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="space-y-3 rounded-2xl border border-ink-100 bg-white p-4">
        <div className="flex flex-wrap gap-3">
          <select
            className="input max-w-xs"
            value={type}
            onChange={(e) => setType(e.target.value as "GENERAL" | "PERSONAL")}
          >
            <option value="GENERAL">{t.admin.generalNotice}</option>
            <option value="PERSONAL">{t.admin.personal}</option>
          </select>
          {type === "PERSONAL" && (
            <input
              className="input max-w-sm"
              type="email"
              required
              placeholder={t.admin.targetEmail}
              value={targetEmail}
              onChange={(e) => setTargetEmail(e.target.value)}
            />
          )}
        </div>
        <input
          className="input"
          required
          placeholder={t.admin.subject}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="input min-h-[100px]"
          required
          placeholder={t.admin.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          {t.admin.create}
        </button>
      </form>

      {editing && (
        <form onSubmit={onSave} className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
          <input
            className="input"
            value={editing.subject}
            onChange={(e) => setEditing({ ...editing, subject: e.target.value })}
            required
          />
          <textarea
            className="input min-h-[100px]"
            value={editing.message}
            onChange={(e) => setEditing({ ...editing, message: e.target.value })}
            required
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

      <div className="space-y-3">
        {initial.map((m) => (
          <article key={m.id} className="rounded-xl border border-ink-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{m.subject}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {typeLabel(m.type || "INBOUND")} · {m.name} · {m.email} ·{" "}
                  {new Date(m.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <div className="flex gap-3 text-sm">
                <button type="button" className="text-brand-600" onClick={() => setEditing(m)}>
                  {t.admin.edit}
                </button>
                <button type="button" className="text-red-600" onClick={() => onDelete(m.id)}>
                  {t.admin.delete}
                </button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-ink-700">{m.message}</p>
          </article>
        ))}
        {initial.length === 0 && <p className="text-ink-500">{t.admin.noMessages}</p>}
      </div>
    </div>
  );
}
