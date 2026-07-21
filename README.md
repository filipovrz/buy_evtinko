# Buy Software — Auctions Evtinko Ltd.

Дигитален магазин за **софтуер, апликации, приложения и файлове** с платено изтегляне и автоматично одобрение след онлайн плащане.

- **Домейн:** [buy-software.evtinko-bg.com](https://buy-software.evtinko-bg.com)
- **Марка:** Auctions Evtinko Ltd.
- **GitHub:** [filipovrz/buy_evtinko](https://github.com/filipovrz/buy_evtinko)

---

## Какво прави сайтът

| Функция | Описание |
|--------|----------|
| Каталог | Продукти по категория/тип, търсене, филтри |
| Количка | Локална количка в браузъра |
| Guest checkout | Пазаруване **без акаунт** (име + имейл) |
| Акаунт | Регистрация, вход, поръчки, изтегляния, профил |
| Плащания | Карта (Stripe), PayPal, ePay.bg + демо режим |
| Автоматично одобрение | След успешно плащане → статус PAID + download токени |
| Админ панел | SUPERADMIN + админи с права; продукти, поръчки, категории, купони, потребители, съобщения, настройки |
| Валута | **EUR** официално; BGN в скоби до 31.12.2026 (курс 1.95583); USD по избор |
| Езици | **English** основен; Bulgarian превод; готови за още локали |
| Документи | `README` / `TODO` / `CHECKPOINT` / `CHAT_HISTORY` + `docs/office2003/*.doc` |

---

## Технологии

- **Next.js 15** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + SQLite (лесно за старт; може MySQL/PostgreSQL в продукция)
- **NextAuth** (credentials)
- **Stripe / PayPal / ePay.bg** интеграции

---

## Локален старт (за разработчика)

```bash
npm install
cp .env.example .env   # вече има .env за разработка
npx prisma db push
npm run db:seed
npm run dev
```

Отвори [http://localhost:3000](http://localhost:3000)

**Админ по подразбиране** (от seed / `.env`) — **SUPERADMIN**:

- Имейл: `admin@evtinko-bg.com`
- Парола: `ChangeMeAdmin123!`  
  **Сменете я преди публикуване!**  
  Суперадминът създава други админи с избрани права в Users.

---

## Какво трябва да дадете вие (хостинг / плащания)

Не е нужно да програмирате. Подгответе следното (може с помощ от хостинг поддръжката):

### 1. Хостинг

Сайтът работи с **Node.js** (не е чист PHP сайт). Нужно е едно от:

- **VPS** (препоръчително) — Ubuntu с Node.js 20+, или  
- Хостинг с **Node.js приложение** (cPanel “Setup Node.js App”, Railway, Render, Vercel, DigitalOcean…)

Също:

- **Домейн / поддомейн** `buy-software.evtinko-bg.com` → DNS A/CNAME към сървъра  
- **SSL сертификат** (Let’s Encrypt / от панела)  
- Имейл за поддръжка (напр. `support@evtinko-bg.com`)

### 2. Платежни акаунти (за реални плащания)

| Метод | Какво да създадете | Какво да ми/на сървъра дадете |
|-------|--------------------|-------------------------------|
| **Карта** | Акаунт в [Stripe](https://dashboard.stripe.com) | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, webhook secret |
| **PayPal** | [PayPal Developer](https://developer.paypal.com) | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, режим live/sandbox |
| **ePay.bg** | Търговски профил в [ePay.bg](https://www.epay.bg) | `EPAY_MIN`, `EPAY_SECRET`, `EPAY_CIN` |

Докато ключовете липсват, в `.env` може `ENABLE_DEMO_PAYMENTS=true` за тест с „Демо плащане“ (автоматично одобрение).

### 3. Сигурност преди пускане

- Сменете `NEXTAUTH_SECRET` (дълъг случаен низ)  
- Сменете админ паролата  
- `ENABLE_DEMO_PAYMENTS=false`  
- `NEXTAUTH_URL` и `NEXT_PUBLIC_SITE_URL` = `https://buy-software.evtinko-bg.com`

---

## Админ панел

След вход като ADMIN: `/admin`

- Продукти + качване на файл за продажба  
- Цени, лицензи, лимит на изтегляния  
- Поръчки (и ръчно одобрение при нужда)  
- Категории, промо кодове, потребители, контактни съобщения  

---

## Документация в репото

| Файл | Съдържание |
|------|------------|
| `TODO.md` | Задачи и приоритети |
| `CHECKPOINT.md` | Състояние / прогрес |
| `CHAT_HISTORY.md` | История на чата с асистента |
| `README.md` | Този файл |

---

## Лиценз / права

© Auctions Evtinko Ltd. Запазена марка. Всички права запазени.
