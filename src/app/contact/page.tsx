"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        subject: fd.get("subject"),
        message: fd.get("message"),
      }),
    });
    setLoading(false);
    setStatus(res.ok ? "Съобщението е изпратено." : "Грешка при изпращане.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <div className="container-page py-14">
      <h1 className="section-title">Контакт</h1>
      <p className="mt-2 text-ink-500">Auctions Evtinko Ltd. · buy-software.evtinko-bg.com</p>
      <form onSubmit={onSubmit} className="mt-8 max-w-lg space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <label className="label">Име</label>
          <input name="name" className="input" required />
        </div>
        <div>
          <label className="label">Имейл</label>
          <input name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label">Тема</label>
          <input name="subject" className="input" required />
        </div>
        <div>
          <label className="label">Съобщение</label>
          <textarea name="message" className="input min-h-[140px]" required />
        </div>
        {status && <p className="text-sm text-accent">{status}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Изпращане..." : "Изпрати"}
        </button>
      </form>
    </div>
  );
}
