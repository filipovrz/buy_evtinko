"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

function ResetForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Паролите не съвпадат / Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">{t.auth.newPassword}</h1>
        {!token && <p className="mt-2 text-sm text-red-600">Missing token</p>}
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">{t.auth.newPassword}</label>
            <input type="password" className="input" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.auth.confirmPassword}</label>
            <input type="password" className="input" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading || !token} className="btn-primary w-full">
            {loading ? t.common.loading : t.common.save}
          </button>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-brand-600 hover:underline">
            {t.nav.login}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
