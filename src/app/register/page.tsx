"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
        <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-semibold">{t.nav.register}</h1>
          <p className="mt-3 text-sm text-ink-600">{t.admin.verifySent}</p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            {t.nav.login}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">{t.nav.register}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {t.auth.haveAccount}{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            {t.nav.login}
          </Link>
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">{t.auth.name}</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.auth.email}</label>
            <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.auth.password}</label>
            <input
              type="password"
              className="input"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.common.loading : t.nav.register}
          </button>
        </div>
      </form>
    </div>
  );
}
