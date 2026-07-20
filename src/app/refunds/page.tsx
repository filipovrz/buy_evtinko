export const metadata = { title: "Връщания" };

export default function RefundsPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="section-title">Политика за връщания</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-600">
        <p>
          Дигиталните продукти се активират автоматично след плащане. Съгласно приложимото право
          за дигитално съдържание, правото на отказ може да бъде ограничено след началото на
          изтеглянето, ако сте се съгласили с това при покупката.
        </p>
        <p>
          При технически проблем (невалиден файл, дублирано плащане) се свържете с нас на
          support@evtinko-bg.com с номера на поръчката — Auctions Evtinko Ltd. ще прегледа случая.
        </p>
      </div>
    </div>
  );
}
