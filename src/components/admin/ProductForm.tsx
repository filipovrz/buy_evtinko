"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT_TYPES, parseJsonArray } from "@/lib/utils";
import { EUR_TO_BGN, formatBgnCompact, isBgnDisplayAllowed } from "@/lib/currency";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  slug: string;
  shortDesc: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  type: string;
  platform?: string | null;
  version?: string | null;
  licenseType: string;
  downloadLimit: number;
  categoryId?: string | null;
  features?: string | null;
  requirements?: string | null;
  coverImage?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  fileName?: string | null;
};

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDesc: product?.shortDesc || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    compareAtPrice: product?.compareAtPrice?.toString() || "",
    currency: product?.currency || "EUR",
    type: product?.type || "SOFTWARE",
    platform: product?.platform || "",
    version: product?.version || "",
    licenseType: product?.licenseType || "SINGLE",
    downloadLimit: product?.downloadLimit?.toString() || "5",
    categoryId: product?.categoryId || "",
    features: parseJsonArray(product?.features).join("\n"),
    requirements: product?.requirements || "",
    coverImage: product?.coverImage || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        downloadLimit: parseInt(form.downloadLimit, 10) || 5,
        categoryId: form.categoryId || null,
        features: form.features
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const url = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Грешка");

      if (file && data.id) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(`/api/admin/products/${data.id}/upload`, {
          method: "POST",
          body: fd,
        });
        if (!up.ok) {
          const ud = await up.json();
          throw new Error(ud.error || "Качването на файла не успя");
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Грешка");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (!product || !confirm("Изтриване на продукта?")) return;
    await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-ink-100 bg-white p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="label">Име *</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Slug (URL)</label>
          <input className="input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" />
        </div>
        <div>
          <label className="label">Тип</label>
          <select className="input" value={form.type} onChange={(e) => set("type", e.target.value)}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Цена (EUR) *</label>
          <input className="input" required type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
          {isBgnDisplayAllowed() && form.price && !Number.isNaN(parseFloat(form.price)) && (
            <p className="mt-1 text-xs text-ink-500">
              Shoppers see: EUR + smaller ({formatBgnCompact(parseFloat(form.price))}) · rate {EUR_TO_BGN} until
              31.12.2026
            </p>
          )}
        </div>
        <div>
          <label className="label">Стара цена (EUR)</label>
          <input className="input" type="number" step="0.01" value={form.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
          {isBgnDisplayAllowed() &&
            form.compareAtPrice &&
            !Number.isNaN(parseFloat(form.compareAtPrice)) && (
              <p className="mt-1 text-xs text-ink-500">({formatBgnCompact(parseFloat(form.compareAtPrice))})</p>
            )}
        </div>
        <div>
          <label className="label">Платформа</label>
          <input className="input" value={form.platform} onChange={(e) => set("platform", e.target.value)} />
        </div>
        <div>
          <label className="label">Версия</label>
          <input className="input" value={form.version} onChange={(e) => set("version", e.target.value)} />
        </div>
        <div>
          <label className="label">Лиценз</label>
          <select className="input" value={form.licenseType} onChange={(e) => set("licenseType", e.target.value)}>
            <option value="SINGLE">Единичен</option>
            <option value="MULTI">Мулти</option>
            <option value="LIFETIME">Доживотен</option>
            <option value="SUBSCRIPTION">Абонамент</option>
          </select>
        </div>
        <div>
          <label className="label">Лимит изтегляния</label>
          <input className="input" type="number" value={form.downloadLimit} onChange={(e) => set("downloadLimit", e.target.value)} />
        </div>
        <div>
          <label className="label">Категория</label>
          <select className="input" value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Cover image URL</label>
          <input className="input" value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Кратко описание *</label>
          <input className="input" required value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Пълно описание *</label>
          <textarea className="input min-h-[120px]" required value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Функции (по един ред)</label>
          <textarea className="input min-h-[100px]" value={form.features} onChange={(e) => set("features", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Изисквания</label>
          <textarea className="input min-h-[80px]" value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className="label">Файл за продажба {product?.fileName ? `(сега: ${product.fileName})` : ""}</label>
          <input
            type="file"
            className="input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          Активен (видим в магазина)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} />
          Препоръчан
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Запис..." : "Запази"}
        </button>
        {product && (
          <button type="button" onClick={onDelete} className="btn-secondary !text-red-600">
            Изтрий
          </button>
        )}
      </div>
    </form>
  );
}
