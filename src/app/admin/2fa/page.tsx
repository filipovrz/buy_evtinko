"use client";

import { FormEvent, useEffect, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

export default function AdminTwoFactorPage() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/2fa");
    const data = await res.json();
    setEnabled(!!data.enabled);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setup() {
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" }),
    });
    const data = await res.json();
    setQr(data.qrDataUrl || "");
    setSecret(data.secret || "");
    setMsg(t.admin.twoFaScan);
  }

  async function enable(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "enable", code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t.common.error);
      return;
    }
    setMsg(t.admin.twoFaEnabledMsg);
    setEnabled(true);
    setCode("");
  }

  async function disable(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "disable", code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || t.common.error);
      return;
    }
    setMsg(t.admin.twoFaDisabledMsg);
    setEnabled(false);
    setQr("");
    setSecret("");
    setCode("");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.twoFa}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {t.admin.twoFaStatus}:{" "}
        <strong className={enabled ? "text-accent" : ""}>
          {enabled ? t.admin.twoFaOn : t.admin.twoFaOff}
        </strong>
      </p>

      <div className="mt-8 max-w-lg space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        {!enabled && (
          <>
            <button type="button" className="btn-primary" onClick={setup}>
              {t.admin.twoFaSetup}
            </button>
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qr} alt="2FA QR" className="h-48 w-48 rounded-lg border border-ink-100" />
            )}
            {secret && <p className="break-all font-mono text-xs text-ink-500">Secret: {secret}</p>}
            {qr && (
              <form onSubmit={enable} className="space-y-3">
                <label className="label">{t.auth.twoFactorCode}</label>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
                <button type="submit" className="btn-accent">
                  {t.admin.twoFaEnable}
                </button>
              </form>
            )}
          </>
        )}

        {enabled && (
          <form onSubmit={disable} className="space-y-3">
            <label className="label">{t.auth.twoFactorCode}</label>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} required />
            <button type="submit" className="btn-secondary !text-red-600">
              {t.admin.twoFaDisable}
            </button>
          </form>
        )}

        {msg && <p className="text-sm text-ink-600">{msg}</p>}
      </div>
    </div>
  );
}
