"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { useI18n } from "@/i18n/use-i18n";

function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [need2fa, setNeed2fa] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      totp,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      const check = await fetch("/api/auth/check-verified", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());
      if (check && check.verified === false) {
        setError(t.admin.emailVerifyRequired);
        return;
      }
      const err = String(res.error);
      if (err.includes("EMAIL_NOT_VERIFIED")) {
        setError(t.admin.emailVerifyRequired);
        return;
      }
      // NextAuth may mask the 2FA error — show 2FA field as fallback
      if (!need2fa) {
        setNeed2fa(true);
        setError("If you have 2FA, enter the authenticator code. Otherwise check email/password.");
      } else {
        setError("Invalid sign-in or 2FA code.");
      }
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">{t.nav.login}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {t.auth.noAccount}{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            {t.nav.register}
          </Link>
        </p>

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => signIn("google", { callbackUrl })}
          >
            {t.auth.signInWithGoogle}
          </button>
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={() => signIn("facebook", { callbackUrl })}
          >
            {t.auth.signInWithFacebook}
          </button>
          <p className="text-center text-xs text-ink-400">{t.auth.socialHint}</p>
        </div>

        <p className="my-4 text-center text-xs uppercase tracking-wider text-ink-400">{t.auth.orEmail}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">{t.auth.email}</label>
            <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">{t.auth.password}</label>
            <input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {(need2fa || totp) && (
            <div>
              <label className="label">{t.auth.twoFactorCode}</label>
              <input className="input" value={totp} onChange={(e) => setTotp(e.target.value)} placeholder="123456" />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? t.common.loading : t.nav.login}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-brand-600 hover:underline">
            {t.nav.forgotPassword}
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-ink-400">
          <Link href="/checkout" className="hover:underline">
            {t.nav.guestCheckout}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
