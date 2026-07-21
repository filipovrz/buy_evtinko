# Chat History — buy-software.evtinko-bg.com

Сесия с AI асистента (Composer / Cursor). Обновява се до края на работата.

---

## 2026-07-21 — Старт на проекта

### Потребител (първо съобщение)

Искане за сайт за продажба на софтуер, апликации, приложения и други файлове с:
- Download със заплащане
- Само онлайн плащане (кредитна карта, epay.bg, PayPal и други) с автоматично одобряване
- Админ панел за файлове, цени и администриране
- Професионална визия и екстри
- Потребителско меню + пазаруване без акаунт
- Хостинг на акаунт на клиента; домейн: `buy-software.evtinko-bg.com`
- Запазена марка: **Auctions Evtinko Ltd.**
- Задължителни файлове: TODO, README, checkpoint, chat history (този файл)
- GitHub: https://github.com/filipovrz/buy_evtinko
- Клиентът не разбира от програмиране — всичко се прави от асистента; да се каже какво се иска от клиента за хостинга
- Ако има допълнителни идеи — да се предложат за одобрение

### Асистент

- Преглед на workspace `G:\Pgojects\sell_app` (празен) и GitHub репото (празно)
- Създаден Next.js 15 + Prisma + NextAuth дигитален магазин
- Каталог, количка, guest checkout, акаунт, плащания (Stripe/PayPal/ePay/DEMO), download токени
- Админ панел: продукти, цени, upload, поръчки, категории, купони, потребители, съобщения, настройки
- Документи: README.md, TODO.md, CHECKPOINT.md, CHAT_HISTORY.md
- Предложени опционални екстри за одобрение (имейл, PDF фактура, EN/BG, социален вход, wishlist, графики, 2FA)

### Статус към края на тази стъпка

- `npm install` + Prisma generate — OK  
- `prisma db push` + seed — OK (админ + демо продукти)  
- `next build` — успешен  
- Dev сървър: http://localhost:3000  
- Git инициализиран; push към GitHub чака одобрение / credentials  
- Документи: README, TODO, CHECKPOINT, CHAT_HISTORY  

### Какво се иска от клиента (хостинг)

1. Хостинг с **Node.js 20+** (VPS или Node App в cPanel) — не само PHP  
2. DNS за `buy-software.evtinko-bg.com`  
3. SSL  
4. Ключове: Stripe, PayPal, ePay.bg (за реални плащания)  
5. Смяна на админ парола преди публикуване  

### Предложени екстри (чака одобрение)

Имейл след покупка, PDF фактура, EN/BG, социален вход, wishlist, графики в админ, 2FA  

---

## 2026-07-21 — Екстри 1–7 + пароли + Office .doc

### Потребител

Одобри всички точки 1–7; добави забравена парола и смяна на парола в потребителското меню; възможност за още езици по-късно; винаги аз да пускам сървъра; сейф на чата ~на 30 мин; другите сейфове след големи промени; всички сейф файлове и като .doc за Office 2003; пита дали да пуска Docker Desktop за DB (на хоста има къде да създаде DB).

### Асистент — направено

1. Имейл след покупка (SMTP или `data/mail-outbox/`) + PDF фактура  
2. i18n BG/EN + LanguageSwitcher + регистър за бъдещи езици  
3. Google / Facebook login (бутони; активират се с ключове в `.env`)  
4. Wishlist  
5. Админ статистики / charts (`/admin/analytics`)  
6. 2FA за админ (`/admin/2fa`)  
7. Забравена парола + смяна на парола в менюто  
8. Office 2003 `.doc` в `docs/office2003/`  
9. Docker: **не е нужен** локално (SQLite); на хостинг — MySQL/Postgres от панела  

Сървър: пуснат отново на http://localhost:3000  

---

## 2026-07-21 — Валута EUR + BGN/USD преглед

### Потребител

Цените да са в евро (официална валута от 01.01.2026). Опция за преизчисление в лева до края на 2026 и в USD по желание.

### Асистент

- Официална валута на магазина: **EUR** (плащане и съхранение)
- Превключвател EUR / BGN / USD в хедъра
- BGN: фиксиран курс 1 EUR = 1.95583 BGN; опцията се крие след 31.12.2026
- USD: курс от `NEXT_PUBLIC_EUR_USD_RATE` (по подразбиране 1.08)
- Seed/админ цени преминати към EUR

---

## 2026-07-21 — Full EN primary i18n

### User

EN translation incomplete (~10%); footer not translated. Make everything English as primary; BG (and future languages) as translations.

### Agent

- DEFAULT_LOCALE = `en`; LOCALES ordered EN then BG
- Expanded UI dictionaries (footer, catalog, product, home, cart, checkout, account…)
- Product/Category English fields + `translations` JSON for BG
- Footer/Catalog/Home/Product/Cart wired to i18n; language switch reloads page for SSR
- Reseeded demo content EN + BG packs

---

## 2026-07-21 — End of day save / pause (earlier)

### User

„Сейф на всичко и навсякъде и почивка до утре!“

### Agent

- Обновени README/TODO/CHECKPOINT/CHAT_HISTORY (+ Office 2003 `.doc`)
- Git commit + push към https://github.com/filipovrz/buy_evtinko

---

## 2026-07-21 — Admin CRUD + EN admin + email verify (night)

### User

- Products: delete buttons  
- Categories: edit buttons  
- Users: add / edit / delete  
- Messages: create (general/personal) + edit + delete  
- Admin panel still BG → EN via locale  
- Admin menu to change name + password  
- Email notifications for admin & users; registration with email confirmation  
- Then save everywhere and rest until tomorrow  

### Agent — done

1. Products list: Edit + Delete  
2. Categories: Edit + Delete (PUT API)  
3. Users: CRUD UI + `/api/admin/users`  
4. Messages: create GENERAL/PERSONAL, edit, delete + emails to customers  
5. Admin UI dictionaries + layout/pages follow locale (EN default)  
6. `/admin/profile` — name + password  
7. Register → verification email + block login until verified; admin notified on register/contact/paid order; buyer order email unchanged  
8. Prisma `ContactMessage.type` / `targetUserId` / `updatedAt`  
9. Docs + Office `.doc` + git push; pause until tomorrow  

---

*(Ще се допълва с всяка следваща стъпка до края на чата.)*


