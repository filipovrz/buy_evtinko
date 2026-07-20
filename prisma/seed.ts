import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@evtinko-bg.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMeAdmin123!";
  const hash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash: hash, name: "Администратор" },
    create: {
      email: adminEmail,
      name: "Администратор",
      role: "ADMIN",
      passwordHash: hash,
    },
  });

  const categories = [
    {
      name: "Софтуер за бизнес",
      slug: "business-software",
      description: "Инструменти за фирми, счетоводство и управление",
      sortOrder: 1,
    },
    {
      name: "Десктоп приложения",
      slug: "desktop-apps",
      description: "Windows и macOS приложения",
      sortOrder: 2,
    },
    {
      name: "Мобилни апликации",
      slug: "mobile-apps",
      description: "Android и iOS пакети",
      sortOrder: 3,
    },
    {
      name: "Шаблони и файлове",
      slug: "templates-files",
      description: "Документи, шаблони, дигитални пакети",
      sortOrder: 4,
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
      shortDesc: "Система за складова наличност и фактуриране за МСП.",
      description:
        "Пълнофункционален софтуер за управление на склад, доставчици и продажби. Подходящ за търговски обекти и онлайн магазини. Включва лиценз за 1 работна станция и 12 месеца обновления.",
      price: 149.0,
      compareAtPrice: 199.0,
      type: "SOFTWARE",
      platform: "Windows",
      version: "3.2.0",
      licenseType: "SINGLE",
      isFeatured: true,
      categoryId: business?.id,
      features: JSON.stringify([
        "Складови карти и баркод",
        "Фактури и стокови разписки",
        "Експорт към Excel/PDF",
        "Многофирмен режим",
      ]),
      requirements: "Windows 10/11, 4 GB RAM, 200 MB свободно място",
      coverImage: "/images/products/inventory.svg",
    },
    {
      name: "Auction Desk Companion",
      slug: "auction-desk-companion",
      shortDesc: "Десктоп помощник за аукционни каталози и лотове.",
      description:
        "Приложение за подготовка на каталози, лотове и оферти. Интегрира се с работния процес на Auctions Evtinko Ltd.",
      price: 89.0,
      type: "APPLICATION",
      platform: "Windows / macOS",
      version: "1.8.1",
      licenseType: "LIFETIME",
      isFeatured: true,
      categoryId: desktop?.id,
      features: JSON.stringify([
        "Импорт на CSV/Excel",
        "Печат на етикети",
        "Шаблони за каталози",
        "Офлайн режим",
      ]),
      requirements: "Windows 10+ или macOS 12+, 2 GB RAM",
      coverImage: "/images/products/auction-desk.svg",
    },
    {
      name: "Evtinko Field Mobile",
      slug: "evtinko-field-mobile",
      shortDesc: "Мобилна апликация за теренни огледи и снимки.",
      description:
        "APK/IPA пакет за теренна работа — заснемане, бележки и синхронизация. Предназначен за партньори и екипи на терен.",
      price: 59.0,
      type: "APP",
      platform: "Android / iOS",
      version: "2.0.4",
      licenseType: "SINGLE",
      isFeatured: true,
      categoryId: mobile?.id,
      features: JSON.stringify([
        "Офлайн снимки",
        "GPS бележки",
        "Бърз експорт",
        "Защитен вход",
      ]),
      requirements: "Android 10+ или iOS 15+",
      coverImage: "/images/products/field-mobile.svg",
    },
    {
      name: "Пакет договори — търговия",
      slug: "contract-pack-trade",
      shortDesc: "Готови шаблони на договори и приложения (DOCX/PDF).",
      description:
        "Дигитален пакет с редакционни шаблони за търговски договори, анекси и протоколи. Файловете се изтеглят след плащане.",
      price: 39.0,
      type: "FILE",
      platform: "Документи",
      version: "2026.1",
      licenseType: "LIFETIME",
      isFeatured: false,
      categoryId: files?.id,
      features: JSON.stringify([
        "15+ шаблона",
        "Редактируеми DOCX",
        "PDF версии",
        "Инструкции за попълване",
      ]),
      requirements: "Microsoft Word / LibreOffice",
      coverImage: "/images/products/contracts.svg",
    },
    {
      name: "Evtinko Reports Studio",
      slug: "evtinko-reports-studio",
      shortDesc: "Генератор на отчети и аналитични табла.",
      description:
        "Софтуер за визуализация на продажби, поръчки и KPI. Подходящ за мениджъри и счетоводители.",
      price: 119.0,
      compareAtPrice: 159.0,
      type: "SOFTWARE",
      platform: "Windows / Web",
      version: "4.1.0",
      licenseType: "MULTI",
      isFeatured: false,
      categoryId: business?.id,
      features: JSON.stringify([
        "Готови дашборди",
        "Планирани имейл отчети",
        "Експорт PNG/PDF",
        "До 5 потребителя",
      ]),
      requirements: "Windows 10+ или модерен браузър",
      coverImage: "/images/products/reports.svg",
    },
    {
      name: "UI Kit — Evtinko Commerce",
      slug: "ui-kit-evtinko-commerce",
      shortDesc: "Дизайнерски файлове и компоненти за електронна търговия.",
      description:
        "Пакет Figma/SVG активи за магазини — бутони, карти, икони и layout блокове в бранда на Evtinko.",
      price: 49.0,
      type: "OTHER",
      platform: "Figma / SVG",
      version: "1.0",
      licenseType: "LIFETIME",
      isFeatured: false,
      categoryId: files?.id,
      features: JSON.stringify([
        "Figma файл",
        "SVG икони",
        "Цветова палитра",
        "Търговска лицензия",
      ]),
      requirements: "Figma или векторна програма",
      coverImage: "/images/products/ui-kit.svg",
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
    site_tagline: "Дигитален магазин за софтуер и файлове",
    support_email: "support@evtinko-bg.com",
    support_phone: "+359 000 000 000",
    company_address: "България",
    vat_note: "Цените са в BGN. Фактура по заявка.",
    footer_text: "© Auctions Evtinko Ltd. Всички права запазени.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  console.log("Seed OK");
  console.log(`Admin: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
