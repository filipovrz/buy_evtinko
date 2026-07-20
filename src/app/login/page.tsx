"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Грешен имейл или парола.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">Вход</h1>
        <p className="mt-1 text-sm text-ink-500">
          Нямате акаунт?{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            Регистрация
          </Link>
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Имейл</label>
            <input type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Парола</label>
            <input type="password" className="input" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Влизане..." : "Вход"}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-ink-400">
          Или{" "}
          <Link href="/checkout" className="text-brand-600 hover:underline">
            пазарувайте без акаунт
          </Link>
        </p>
      </form>
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
