import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-xl font-semibold text-white">Buy Software</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-300">
            Auctions Evtinko Ltd.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-400">
            Официален дигитален магазин за софтуер, апликации, приложения и файлове.
            Сигурно онлайн плащане и автоматично изтегляне.
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Магазин</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:text-white">Каталог</Link></li>
            <li><Link href="/cart" className="hover:text-white">Количка</Link></li>
            <li><Link href="/checkout" className="hover:text-white">Плащане без акаунт</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">Как работи</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Акаунт</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-white">Вход</Link></li>
            <li><Link href="/register" className="hover:text-white">Регистрация</Link></li>
            <li><Link href="/account" className="hover:text-white">Моят акаунт</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">Поръчки</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Информация</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-white">Общи условия</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Поверителност</Link></li>
            <li><Link href="/refunds" className="hover:text-white">Връщания</Link></li>
            <li><Link href="/contact" className="hover:text-white">Контакт</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Auctions Evtinko Ltd. Запазена марка. Всички права запазени.</p>
          <p>buy-software.evtinko-bg.com · Плащания: карта · PayPal · ePay.bg</p>
        </div>
      </div>
    </footer>
  );
}
