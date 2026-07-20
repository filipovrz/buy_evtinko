"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
};

export function CategoryManager({ initial }: { initial: Cat[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setName("");
    setDescription("");
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Изтриване?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4">
        <input className="input max-w-xs" placeholder="Име" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input max-w-sm" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit" className="btn-primary">Добави</button>
      </form>
      <div className="space-y-2">
        {initial.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-ink-100 bg-white px-4 py-3">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-ink-500">{c.slug} · {c._count.products} продукта</p>
            </div>
            <button type="button" className="text-sm text-red-600" onClick={() => onDelete(c.id)}>
              Изтрий
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
