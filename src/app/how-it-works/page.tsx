import Link from "next/link";

export const metadata = { title: "Как работи" };

const steps = [
  { n: "1", t: "Изберете продукт", d: "Разгледайте каталога — софтуер, апликации, приложения или файлове." },
  { n: "2", t: "Добавете в количката", d: "Пазарувайте с акаунт или като гост — без задължителна регистрация." },
  { n: "3", t: "Платете онлайн", d: "Кредитна/дебитна карта (Stripe), PayPal или ePay.bg. Без наложен платеж." },
  { n: "4", t: "Автоматично одобрение", d: "След успешно плащане поръчката се активира веднага." },
  { n: "5", t: "Изтеглете", d: "Получавате защитен линк и лицензен ключ. Лимит и срок за download." },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page py-14">
      <h1 className="section-title">Как работи</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Buy Software by Auctions Evtinko Ltd. — дигитална покупка с автоматично изтегляне.
      </p>
      <ol className="mt-12 space-y-6">
        {steps.map((s) => (
          <li key={s.n} className="flex gap-5 rounded-2xl border border-ink-100 bg-white p-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-display text-lg font-semibold text-white">
              {s.n}
            </span>
            <div>
              <p className="font-semibold text-ink-900">{s.t}</p>
              <p className="mt-1 text-sm text-ink-500">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link href="/catalog" className="btn-primary mt-10 inline-flex">
        Към каталога
      </Link>
    </div>
  );
}
