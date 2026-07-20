import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { CreditCard, ShieldCheck, Zap, Download, Lock, Headphones } from "lucide-react";
import { getServerDictionary } from "@/i18n/server";
import { localizeContent } from "@/i18n/localize";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { locale, t } = await getServerDictionary();

  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  const features = [
    { icon: CreditCard, title: t.home.onlyOnline, text: t.home.onlyOnlineText },
    { icon: Zap, title: t.home.automatic, text: t.home.automaticText },
    { icon: Download, title: t.home.secureDl, text: t.home.secureDlText },
    { icon: Headphones, title: t.home.supportTitle, text: t.home.supportText },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-hero-mesh text-white">
        <div className="pointer-events-none absolute inset-0 bg-surface-grain opacity-40" />
        <div className="pointer-events-none absolute inset-0 hero-shimmer" />
        <div className="container-page relative grid min-h-[78vh] items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <p className="mb-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {t.common.company}
            </p>
            <h1 className="max-w-xl text-xl font-medium text-brand-100 sm:text-2xl">{t.home.headline}</h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-300">{t.home.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn-primary !px-6 !py-3 text-base">
                {t.home.browseCatalog}
              </Link>
              <Link
                href="/checkout"
                className="btn-secondary !border-white/20 !bg-white/10 !px-6 !py-3 text-base !text-white hover:!bg-white/20"
              >
                {t.home.buyAsGuest}
              </Link>
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ink-400">
              buy-software.evtinko-bg.com
            </p>
          </div>
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/30 via-ink-900/50 to-accent/20 p-8 shadow-2xl shadow-black/40">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-500/30 blur-3xl" />
              <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-brand-100">
                    <Lock className="h-3.5 w-3.5" /> {t.home.secureDownload}
                  </div>
                  <p className="font-display text-3xl font-semibold">{t.home.payDownload}</p>
                  <p className="max-w-sm text-sm text-ink-300">{t.home.payDownloadText}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: CreditCard, label: t.home.card },
                    { icon: Zap, label: "ePay.bg" },
                    { icon: ShieldCheck, label: "PayPal" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur"
                    >
                      <item.icon className="mx-auto mb-1.5 h-5 w-5 text-accent-light" />
                      <p className="text-xs font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-ink-100 bg-white py-10">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="flex gap-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-ink-900">{f.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-accent">{t.home.featured}</p>
            <h2 className="section-title">{t.home.featuredTitle}</h2>
          </div>
          <Link href="/catalog" className="btn-secondary">
            {t.common.viewAll}
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
            {t.home.noProductsYet}
          </p>
        )}
      </section>

      <section className="bg-ink-50 py-16 md:py-20">
        <div className="container-page">
          <h2 className="section-title mb-8">{t.home.categories}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => {
              const loc = localizeContent(
                { name: c.name, shortDesc: c.description, translations: c.translations },
                locale
              );
              return (
                <Link
                  key={c.id}
                  href={`/catalog?category=${c.slug}`}
                  className="rounded-2xl border border-ink-100 bg-white p-6 transition hover:border-brand-200 hover:shadow-md"
                >
                  <p className="font-display text-lg font-semibold text-ink-950">{loc.name}</p>
                  <p className="mt-2 text-sm text-ink-500">{loc.shortDesc}</p>
                  <p className="mt-4 text-xs font-medium text-brand-600">
                    {c._count.products} {t.home.productsCount} →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-brand-950 to-ink-900 px-8 py-12 text-white md:px-12">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">{t.home.ctaTitle}</h2>
            <p className="mt-4 text-ink-300">{t.home.ctaText}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary">
                {t.home.createAccount}
              </Link>
              <Link
                href="/catalog"
                className="btn-secondary !border-white/20 !bg-transparent !text-white hover:!bg-white/10"
              >
                {t.home.toCatalog}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
