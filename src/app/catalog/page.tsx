import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";
import { getServerDictionary } from "@/i18n/server";
import { localizeContent } from "@/i18n/localize";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    category?: string;
    type?: string;
    q?: string;
    sort?: string;
  }>;
};

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: t.catalog.title };
}

export default async function CatalogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { locale, t } = await getServerDictionary();
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
      { translations: { contains: sp.q } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (sp.sort === "price-asc") orderBy = { price: "asc" };
  if (sp.sort === "price-desc") orderBy = { price: "desc" };
  if (sp.sort === "name") orderBy = { name: "asc" };

  const products = await prisma.product.findMany({ where, orderBy });

  const typeKeys = Object.keys(t.productTypes) as (keyof typeof t.productTypes)[];

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mb-8">
        <h1 className="section-title">{t.catalog.title}</h1>
        <p className="mt-2 text-ink-500">{t.catalog.subtitle}</p>
      </div>

      <form className="mb-8 flex flex-wrap gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
        <input
          name="q"
          defaultValue={sp.q || ""}
          placeholder={t.catalog.searchPlaceholder}
          className="input max-w-xs"
        />
        <select name="category" defaultValue={sp.category || ""} className="input max-w-[200px]">
          <option value="">{t.catalog.allCategories}</option>
          {categories.map((c) => {
            const loc = localizeContent(
              { name: c.name, shortDesc: c.description, translations: c.translations },
              locale
            );
            return (
              <option key={c.id} value={c.slug}>
                {loc.name}
              </option>
            );
          })}
        </select>
        <select name="type" defaultValue={sp.type || ""} className="input max-w-[180px]">
          <option value="">{t.catalog.allTypes}</option>
          {typeKeys.map((key) => (
            <option key={key} value={key}>
              {t.productTypes[key]}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort || ""} className="input max-w-[180px]">
          <option value="">{t.catalog.newest}</option>
          <option value="price-asc">{t.catalog.priceAsc}</option>
          <option value="price-desc">{t.catalog.priceDesc}</option>
          <option value="name">{t.catalog.name}</option>
        </select>
        <button type="submit" className="btn-primary">
          {t.common.filter}
        </button>
        <Link href="/catalog" className="btn-ghost">
          {t.common.clear}
        </Link>
      </form>

      <p className="mb-4 text-sm text-ink-500">
        {products.length} {t.catalog.results}
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="rounded-xl border border-dashed border-ink-200 bg-white p-12 text-center text-ink-500">
          {t.catalog.empty}
        </p>
      )}
    </div>
  );
}
