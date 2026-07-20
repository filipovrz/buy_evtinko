import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function bg(pack: {
  name: string;
  shortDesc: string;
  description: string;
  features: string[];
  requirements: string;
}) {
  return JSON.stringify({ bg: pack });
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@evtinko-bg.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!";
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash: hash, name: "Administrator", locale: "en" },
    create: {
      email: adminEmail,
      name: "Administrator",
      role: "ADMIN",
      passwordHash: hash,
      locale: "en",
    },
  });

  const categories = [
    {
      name: "Business software",
      slug: "business-software",
      description: "Tools for companies, accounting and management",
      sortOrder: 1,
      translations: JSON.stringify({
        bg: {
          name: "Софтуер за бизнес",
          shortDesc: "Инструменти за фирми, счетоводство и управление",
        },
      }),
    },
    {
      name: "Desktop apps",
      slug: "desktop-apps",
      description: "Windows and macOS applications",
      sortOrder: 2,
      translations: JSON.stringify({
        bg: {
          name: "Десктоп приложения",
          shortDesc: "Windows и macOS приложения",
        },
      }),
    },
    {
      name: "Mobile apps",
      slug: "mobile-apps",
      description: "Android and iOS packages",
      sortOrder: 3,
      translations: JSON.stringify({
        bg: {
          name: "Мобилни апликации",
          shortDesc: "Android и iOS пакети",
        },
      }),
    },
    {
      name: "Templates & files",
      slug: "templates-files",
      description: "Documents, templates and digital packs",
      sortOrder: 4,
      translations: JSON.stringify({
        bg: {
          name: "Шаблони и файлове",
          shortDesc: "Документи, шаблони, дигитални пакети",
        },
      }),
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  const business = await prisma.category.findUnique({ where: { slug: "business-software" } });
  const desktop = await prisma.category.findUnique({ where: { slug: "desktop-apps" } });
  const mobile = await prisma.category.findUnique({ where: { slug: "mobile-apps" } });
  const files = await prisma.category.findUnique({ where: { slug: "templates-files" } });

  const products = [
    {
      name: "Evtinko Inventory Pro",
      slug: "evtinko-inventory-pro",
      shortDesc: "Inventory and invoicing system for SMEs.",
      description:
        "Full-featured software for warehouse, suppliers and sales. Suitable for retail and online stores. Includes a 1-workstation license and 12 months of updates.",
      price: 76.18,
      compareAtPrice: 101.75,
      currency: "EUR",
      type: "SOFTWARE",
      platform: "Windows",
      version: "3.2.0",
      licenseType: "SINGLE",
      isFeatured: true,
      categoryId: business?.id,
      features: JSON.stringify([
        "Stock cards and barcodes",
        "Invoices and delivery notes",
        "Export to Excel/PDF",
        "Multi-company mode",
      ]),
      requirements: "Windows 10/11, 4 GB RAM, 200 MB free space",
      coverImage: "/images/products/inventory.svg",
      translations: bg({
        name: "Evtinko Inventory Pro",
        shortDesc: "Система за складова наличност и фактуриране за МСП.",
        description:
          "Пълнофункционален софтуер за управление на склад, доставчици и продажби. Подходящ за търговски обекти и онлайн магазини. Включва лиценз за 1 работна станция и 12 месеца обновления.",
        features: [
          "Складови карти и баркод",
          "Фактури и стокови разписки",
          "Експорт към Excel/PDF",
          "Многофирмен режим",
        ],
        requirements: "Windows 10/11, 4 GB RAM, 200 MB свободно място",
      }),
    },
    {
      name: "Auction Desk Companion",
      slug: "auction-desk-companion",
      shortDesc: "Desktop helper for auction catalogues and lots.",
      description:
        "Application for preparing catalogues, lots and offers. Integrates with the Auctions Evtinko Ltd. workflow.",
      price: 45.5,
      currency: "EUR",
      type: "APPLICATION",
      platform: "Windows / macOS",
      version: "1.8.1",
      licenseType: "LIFETIME",
      isFeatured: true,
      categoryId: desktop?.id,
      features: JSON.stringify([
        "CSV/Excel import",
        "Label printing",
        "Catalogue templates",
        "Offline mode",
      ]),
      requirements: "Windows 10+ or macOS 12+, 2 GB RAM",
      coverImage: "/images/products/auction-desk.svg",
      translations: bg({
        name: "Auction Desk Companion",
        shortDesc: "Десктоп помощник за аукционни каталози и лотове.",
        description:
          "Приложение за подготовка на каталози, лотове и оферти. Интегрира се с работния процес на Auctions Evtinko Ltd.",
        features: ["Импорт на CSV/Excel", "Печат на етикети", "Шаблони за каталози", "Офлайн режим"],
        requirements: "Windows 10+ или macOS 12+, 2 GB RAM",
      }),
    },
    {
      name: "Evtinko Field Mobile",
      slug: "evtinko-field-mobile",
      shortDesc: "Mobile app for field inspections and photos.",
      description:
        "APK/IPA package for field work — capture, notes and sync. Designed for partners and field teams.",
      price: 30.17,
      currency: "EUR",
      type: "APP",
      platform: "Android / iOS",
      version: "2.0.4",
      licenseType: "SINGLE",
      isFeatured: true,
      categoryId: mobile?.id,
      features: JSON.stringify(["Offline photos", "GPS notes", "Quick export", "Secure login"]),
      requirements: "Android 10+ or iOS 15+",
      coverImage: "/images/products/field-mobile.svg",
      translations: bg({
        name: "Evtinko Field Mobile",
        shortDesc: "Мобилна апликация за теренни огледи и снимки.",
        description:
          "APK/IPA пакет за теренна работа — заснемане, бележки и синхронизация. Предназначен за партньори и екипи на терен.",
        features: ["Офлайн снимки", "GPS бележки", "Бърз експорт", "Защитен вход"],
        requirements: "Android 10+ или iOS 15+",
      }),
    },
    {
      name: "Trade contracts pack",
      slug: "contract-pack-trade",
      shortDesc: "Ready contract templates and annexes (DOCX/PDF).",
      description:
        "Digital pack with editable commercial contract templates, annexes and protocols. Files download after payment.",
      price: 19.94,
      currency: "EUR",
      type: "FILE",
      platform: "Documents",
      version: "2026.1",
      licenseType: "LIFETIME",
      isFeatured: false,
      categoryId: files?.id,
      features: JSON.stringify([
        "15+ templates",
        "Editable DOCX",
        "PDF versions",
        "Fill-in instructions",
      ]),
      requirements: "Microsoft Word / LibreOffice",
      coverImage: "/images/products/contracts.svg",
      translations: bg({
        name: "Пакет договори — търговия",
        shortDesc: "Готови шаблони на договори и приложения (DOCX/PDF).",
        description:
          "Дигитален пакет с редакционни шаблони за търговски договори, анекси и протоколи. Файловете се изтеглят след плащане.",
        features: ["15+ шаблона", "Редактируеми DOCX", "PDF версии", "Инструкции за попълване"],
        requirements: "Microsoft Word / LibreOffice",
      }),
    },
    {
      name: "Evtinko Reports Studio",
      slug: "evtinko-reports-studio",
      shortDesc: "Report generator and analytics dashboards.",
      description:
        "Software for visualising sales, orders and KPIs. Suitable for managers and accountants.",
      price: 60.84,
      compareAtPrice: 81.29,
      currency: "EUR",
      type: "SOFTWARE",
      platform: "Windows / Web",
      version: "4.1.0",
      licenseType: "MULTI",
      isFeatured: false,
      categoryId: business?.id,
      features: JSON.stringify([
        "Ready dashboards",
        "Scheduled email reports",
        "PNG/PDF export",
        "Up to 5 users",
      ]),
      requirements: "Windows 10+ or a modern browser",
      coverImage: "/images/products/reports.svg",
      translations: bg({
        name: "Evtinko Reports Studio",
        shortDesc: "Генератор на отчети и аналитични табла.",
        description:
          "Софтуер за визуализация на продажби, поръчки и KPI. Подходящ за мениджъри и счетоводители.",
        features: [
          "Готови дашборди",
          "Планирани имейл отчети",
          "Експорт PNG/PDF",
          "До 5 потребителя",
        ],
        requirements: "Windows 10+ или модерен браузър",
      }),
    },
    {
      name: "UI Kit — Evtinko Commerce",
      slug: "ui-kit-evtinko-commerce",
      shortDesc: "Design files and components for e-commerce.",
      description:
        "Figma/SVG asset pack for stores — buttons, cards, icons and layout blocks in the Evtinko brand.",
      price: 25.05,
      currency: "EUR",
      type: "OTHER",
      platform: "Figma / SVG",
      version: "1.0",
      licenseType: "LIFETIME",
      isFeatured: false,
      categoryId: files?.id,
      features: JSON.stringify(["Figma file", "SVG icons", "Color palette", "Commercial license"]),
      requirements: "Figma or a vector editor",
      coverImage: "/images/products/ui-kit.svg",
      translations: bg({
        name: "UI Kit — Evtinko Commerce",
        shortDesc: "Дизайнерски файлове и компоненти за електронна търговия.",
        description:
          "Пакет Figma/SVG активи за магазини — бутони, карти, икони и layout блокове в бранда на Evtinko.",
        features: ["Figma файл", "SVG икони", "Цветова палитра", "Търговска лицензия"],
        requirements: "Figma или векторна програма",
      }),
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      discountType: "PERCENT",
      discountValue: 10,
      maxUses: 1000,
      isActive: true,
    },
  });

  const settings: Record<string, string> = {
    site_tagline: "Digital store for software and files",
    support_email: "support@evtinko-bg.com",
    support_phone: "+359 000 000 000",
    company_address: "Bulgaria",
    vat_note:
      "Official currency: EUR (since 01.01.2026). BGN conversion until 31.12.2026. USD optional.",
    footer_text: "© Auctions Evtinko Ltd. All rights reserved.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seed OK (EN primary + BG translations)");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
