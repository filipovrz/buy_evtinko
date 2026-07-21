"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    site_tagline: initial.site_tagline || "",
    support_email: initial.support_email || "",
    support_phone: initial.support_phone || "",
    company_address: initial.company_address || "",
    vat_note: initial.vat_note || "",
    footer_text: initial.footer_text || "",
  });
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setMsg(res.ok ? t.common.success : t.common.error);
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
      {(Object.keys(form) as (keyof typeof form)[]).map((key) => (
        <div key={key}>
          <label className="label">{key}</label>
          <input
            className="input"
            value={form[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        </div>
      ))}
      {msg && <p className="text-sm text-accent">{msg}</p>}
      <button type="submit" className="btn-primary">
        {t.admin.save}
      </button>
    </form>
  );
}
