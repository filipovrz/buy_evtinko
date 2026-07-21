import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { getServerDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.categories} — Admin` };
}

export default async function AdminCategoriesPage() {
  const { t } = await getServerDictionary();
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.categories}</h1>
      <div className="mt-8">
        <CategoryManager initial={categories} />
      </div>
    </div>
  );
}
