"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/account/profile");
    if (session?.user?.name) setName(session.user.name);
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/account/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setName(d.user.name || "");
          setPhone(d.user.phone || "");
          setCompany(d.user.company || "");
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/account/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, company }),
    });
    setLoading(false);
    setMessage(res.ok ? "Запазено." : "Грешка при запис.");
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="section-title">Профил</h1>
        <Link href="/account" className="btn-ghost">
          ← Акаунт
        </Link>
      </div>
      <form onSubmit={onSubmit} className="max-w-lg space-y-4 rounded-2xl border border-ink-100 bg-white p-6">
        <div>
          <label className="label">Имейл</label>
          <input className="input bg-ink-50" disabled value={session?.user?.email || ""} />
        </div>
        <div>
          <label className="label">Име</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Телефон</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Фирма</label>
          <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        {message && <p className="text-sm text-accent">{message}</p>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Запис..." : "Запази"}
        </button>
      </form>
    </div>
  );
}
