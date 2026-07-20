"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export default function ChangePasswordPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/account/password");
  }, [status, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("Паролите не съвпадат");
      return;
    }
    setLoading(true);
    setError("");
    setMsg("");
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || t.common.error);
      return;
    }
    setMsg(t.auth.changeSuccess);
    setCurrent("");
    setNew("");
    setConfirm("");
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title">{t.auth.changeTitle}</h1>
        <Link href="/account" className="btn-ghost">
          ← {t.nav.myAccount}
        </Link>
      </div>
      <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <label className="label">{t.auth.currentPassword}</label>
          <input type="password" className="input" required value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.auth.newPassword}</label>
          <input type="password" className="input" required minLength={8} value={newPassword} onChange={(e) => setNew(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.auth.confirmPassword}</label>
          <input type="password" className="input" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-accent">{msg}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? t.common.loading : t.common.save}
        </button>
      </form>
    </div>
  );
}
