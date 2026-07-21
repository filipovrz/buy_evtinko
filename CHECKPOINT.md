# CHECKPOINT — Buy Software

**Проект:** buy-software.evtinko-bg.com  
**Марка:** Auctions Evtinko Ltd.  
**Репо:** https://github.com/filipovrz/buy_evtinko  
**Дата:** 2026-07-21 (night save / pause until tomorrow)

---

## Статус: запазено — почивка до утре

Работещ магазин + пълен админ CRUD + email verification.

### Готово към този сейф

| Област | Статус |
|--------|--------|
| Магазин / checkout / guest | OK |
| Плащания Stripe/PayPal/ePay + DEMO | OK |
| Админ: products delete, categories edit, users CRUD, messages CRUD | OK |
| Админ профил (име/парола) | OK |
| Админ UI следва EN/BG locale | OK |
| Email verify при регистрация | OK |
| Имейл към админ (регистрация, контакт, платена поръчка) | OK |
| Имейл към купувач след PAID + PDF | OK |
| Валута EUR (+ BGN / USD) | OK |
| i18n EN primary / BG | OK |
| Документи md + Office 2003 .doc | OK |
| GitHub | push при този сейф |

### Следващ път (утре+)

1. Хостинг / DNS / SSL  
2. Реални ключове (плащания, SMTP, OAuth)  
3. Реални продуктови файлове  
4. Deploy  

### Достъп локално

- Сайт: http://localhost:3000  
- Админ: `admin@evtinko-bg.com` / `ChangeMeAdmin123!`  
- Без SMTP: писмата отиват в `data/mail-outbox/`

### Office сейфове

`docs/office2003/README.doc`, `TODO.doc`, `CHECKPOINT.doc`, `CHAT_HISTORY.doc`
