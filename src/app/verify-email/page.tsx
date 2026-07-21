"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

function VerifyInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        setStatus(res.ok ? "ok" : "error");
      })
      .catch(() => setStatus("error"));
  }, [token, email]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold">
          {status === "ok" ? t.common.success : status === "error" ? t.common.error : t.common.loading}
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          {status === "ok" && "Your email is verified. You can sign in now."}
          {status === "error" && "Invalid or expired verification link."}
          {status === "loading" && t.common.loading}
        </p>
        {status === "ok" && (
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            {t.nav.login}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  );
}
