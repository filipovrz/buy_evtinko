# TODO — Buy Software (Auctions Evtinko Ltd.)

Последна актуализация: 2026-07-21 (night сейф / pause до утре)

## Готово

- [x] Next.js магазин (каталог, продукт, количка, checkout)
- [x] Guest checkout + потребителски акаунт
- [x] Плащания: Stripe, PayPal, ePay.bg + демо авто-одобрение
- [x] Сигурни download токени след PAID
- [x] Админ панел: продукти, цени, upload, поръчки, категории, купони, потребители, съобщения, настройки
- [x] Админ CRUD: delete продукти, edit категории, users add/edit/delete, messages create/edit/delete
- [x] Админ профил (име + парола)
- [x] Админ UI следва език (EN primary)
- [x] Email verification при регистрация + известия (админ/потребители)
- [x] Страници: как работи, лицензи, поддръжка, контакт, условия, поверителност, връщания
- [x] Seed продукти + админ потребител
- [x] README, TODO, CHECKPOINT, CHAT_HISTORY (+ Office 2003 .doc)
- [x] Бранд: Auctions Evtinko Ltd. / buy-software.evtinko-bg.com
- [x] Имейл след покупка + PDF фактура
- [x] **EN основен език** / BG превод (разширяемо)
- [x] Google/Facebook login (с ключове)
- [x] Wishlist
- [x] Админ графики
- [x] 2FA за админ
- [x] Забравена / смяна на парола
- [x] Валута **EUR** (+ BGN до 31.12.2026, USD по избор)

## Следващи стъпки (утре+)

- [ ] Потвърждение на хостинг тип (VPS / Node.js хостинг)
- [ ] DNS за `buy-software.evtinko-bg.com`
- [ ] SSL
- [ ] MySQL на хостинга
- [ ] Реални ключове Stripe / PayPal / ePay.bg / SMTP / Google / Facebook
- [ ] Смяна на админ парола и `NEXTAUTH_SECRET`
- [ ] Качване на реални файлове за продажба
- [ ] Deploy
- [ ] Тест на реално плащане (малка сума)

## Известни ограничения

- SQLite по подразбиране — за прод → MySQL/PostgreSQL
- Без качени файлове download връща демо `.txt`
- Някои вторични страници (terms/support) може още да имат фиксиран текст — допълват се при нужда
