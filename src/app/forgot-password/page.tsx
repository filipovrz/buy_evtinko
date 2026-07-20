"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setDone(true);
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">{t.auth.resetTitle}</h1>
        {done ? (
          <p className="mt-4 text-sm text-accent">{t.auth.resetSent}</p>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">{t.auth.email}</label>
              <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t.common.loading : t.auth.resetSubmit}
            </button>
          </div>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-brand-600 hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </form>
    </div>
  );
}
