import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { guardAdminPage } from "@/lib/admin-guard";
import { getServerDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.newProduct} — Admin` };
}

export default async function NewProductPage() {
  await guardAdminPage("products");
  const { t } = await getServerDictionary();
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t.admin.newProduct}</h1>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
