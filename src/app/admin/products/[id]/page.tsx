import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { guardAdminPage } from "@/lib/admin-guard";
import { getServerDictionary } from "@/i18n/server";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata() {
  const { t } = await getServerDictionary();
  return { title: `${t.admin.edit} — Admin` };
}

export default async function EditProductPage({ params }: Props) {
  await guardAdminPage("products");
  const { t } = await getServerDictionary();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        {t.admin.edit}: {product.name}
      </h1>
      <div className="mt-8">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
