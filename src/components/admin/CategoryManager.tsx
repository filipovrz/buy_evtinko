"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/use-i18n";

type Cat = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  _count: { products: number };
};

export function CategoryManager({ initial }: { initial: Cat[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Cat | null>(null);

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

  async function onSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    await fetch(`/api/admin/categories/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editing.name,
        description: editing.description,
        sortOrder: editing.sortOrder,
      }),
    });
    setEditing(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t.admin.confirmDelete)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onCreate} className="flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4">
        <input
          className="input max-w-xs"
          placeholder={t.admin.name}
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input max-w-sm"
          placeholder={t.admin.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          {t.admin.add}
        </button>
      </form>

      {editing && (
        <form onSubmit={onSaveEdit} className="flex flex-wrap gap-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4">
          <input
            className="input max-w-xs"
            value={editing.name}
            onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            required
          />
          <input
            className="input max-w-sm"
            value={editing.description || ""}
            onChange={(e) => setEditing({ ...editing, description: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            {t.admin.save}
          </button>
          <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
            {t.common.cancel}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {initial.map((c) => (
          <div
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-ink-500">
                {c.slug} · {c._count.products} · {c.description || "—"}
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-sm text-brand-600" onClick={() => setEditing(c)}>
                {t.admin.edit}
              </button>
              <button type="button" className="text-sm text-red-600" onClick={() => onDelete(c.id)}>
                {t.admin.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
