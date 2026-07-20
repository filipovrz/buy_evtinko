export const metadata = { title: "Поддръжка" };

export default function SupportPage() {
  return (
    <div className="container-page py-14">
      <h1 className="section-title">Поддръжка</h1>
      <div className="mt-8 max-w-2xl space-y-6 rounded-2xl border border-ink-100 bg-white p-8">
        <p className="text-ink-600">
          За въпроси относно поръчки, лицензи и изтегляния се свържете с екипа на{" "}
          <strong>Auctions Evtinko Ltd.</strong>
        </p>
        <ul className="space-y-2 text-sm text-ink-600">
          <li>Имейл: support@evtinko-bg.com</li>
          <li>Домейн: buy-software.evtinko-bg.com</li>
          <li>Работно време: според обявеното на основния сайт на Evtinko</li>
        </ul>
        <p className="text-sm text-ink-500">
          Ако не можете да изтеглите файл след плащане — проверете имейла на поръчката,
          влезте в „Моите изтегляния“ или ни пишете с номера на поръчката (EV-…).
        </p>
      </div>
    </div>
  );
}
