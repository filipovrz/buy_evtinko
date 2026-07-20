import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Категории — Админ" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Категории</h1>
      <div className="mt-8">
        <CategoryManager initial={categories} />
      </div>
    </div>
  );
}
