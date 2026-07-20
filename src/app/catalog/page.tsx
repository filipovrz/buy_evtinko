import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { PRODUCT_TYPES } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Каталог" };

type Props = {
  searchParams: Promise<{
    category?: string;
    type?: string;
    q?: string;
    sort?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  const where: Record<string, unknown> = { isActive: true };
  if (sp.category) {
    where.category = { slug: sp.category };
  }
  if (sp.type) where.type = sp.type;
  if (sp.q) {
    where.OR = [
      { name: { contains: sp.q } },
      { shortDesc: { contains: sp.q } },
      { description: { contains: sp.q } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sp.sort === "price-asc") orderBy = { price: "asc" };
  if (sp.sort === "price-desc") orderBy = { price: "desc" };
  if (sp.sort === "name") orderBy = { name: "asc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
  });

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8">
        <h1 className="section-title">Каталог</h1>
        <p className="mt-2 text-ink-500">Софтуер, апликации, приложения и файлове за изтегляне.</p>
      </div>

      <form className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder="Търсене..."
          className="input max-w-xs"
        />
        <select name="category" defaultValue={sp.category || ""} className="input max-w-[200px]">
          <option value="">Всички категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={sp.type || ""} className="input max-w-[180px]">
          <option value="">Всички типове</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort || ""} className="input max-w-[180px]">
          <option value="">Най-нови</option>
          <option value="price-asc">Цена ↑</option>
          <option value="price-desc">Цена ↓</option>
          <option value="name">Име</option>
        </select>
        <button type="submit" className="btn-primary">
          Филтрирай
        </button>
        <Link href="/catalog" className="btn-ghost">
          Изчисти
        </Link>
      </form>

      <p className="mb-4 text-sm text-ink-500">{products.length} резултата</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink-200 bg-white p-12 text-center text-ink-500">
          Няма намерени продукти.
        </p>
      )}
    </div>
  );
}
