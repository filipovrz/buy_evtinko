# CHECKPOINT — Buy Software

**Проект:** buy-software.evtinko-bg.com  
**Марка:** Auctions Evtinko Ltd.  
**Репо:** https://github.com/filipovrz/buy_evtinko  
**Дата:** 2026-07-21 (сейф / почивка)

---

## Статус: запазено — почивка

Работещ магазин + SUPERADMIN / права на админи + EUR/BGN dual price.

### Готово към този сейф

| Област | Статус |
|--------|--------|
| Магазин / checkout / guest | OK |
| Плащания Stripe/PayPal/ePay + DEMO | OK |
| Админ CRUD (products/categories/users/messages) | OK |
| **SUPERADMIN** + админи с грануларни права | OK |
| Админ профил (име/парола) + 2FA | OK |
| Админ UI следва EN/BG locale | OK |
| Email verify + известия | OK |
| Цени: EUR + по-малка BGN в скоби (×1.95583 до 31.12.2026) | OK |
| Валута EUR (+ BGN / USD switcher) | OK |
| i18n EN primary / BG | OK |
| Документи md + Office 2003 .doc | OK |
| GitHub | push при този сейф |

### Следващ път

1. Хостинг / DNS / SSL  
2. Реални ключове (плащания, SMTP, OAuth)  
3. Реални продуктови файлове  
4. Deploy  

### Достъп локално

- Сайт: http://localhost:3000  
- Superadmin: `admin@evtinko-bg.com` / `ChangeMeAdmin123!`  
- Без SMTP: писма в `data/mail-outbox/`

### Office сейфове

`docs/office2003/README.doc`, `TODO.doc`, `CHECKPOINT.doc`, `CHAT_HISTORY.doc`
