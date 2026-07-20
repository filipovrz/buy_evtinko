export const metadata = { title: "Лицензи" };

export default function PricingPage() {
  const licenses = [
    {
      name: "Единичен (SINGLE)",
      desc: "Една инсталация / едно устройство. Подходящ за индивидуални клиенти.",
    },
    {
      name: "Мулти (MULTI)",
      desc: "Няколко потребители или работни станции според описанието на продукта.",
    },
    {
      name: "Доживотен (LIFETIME)",
      desc: "Еднократно плащане без срок на лиценза (обновленията са по описание).",
    },
    {
      name: "Абонамент (SUBSCRIPTION)",
      desc: "Периодичен достъп — когато е посочено за конкретния продукт.",
    },
  ];

  return (
    <div className="container-page py-14">
      <h1 className="section-title">Лицензи</h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        Всеки продукт има ясен тип лиценз. Детайлите са на страницата на продукта.
        Продавач: Auctions Evtinko Ltd.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {licenses.map((l) => (
          <div key={l.name} className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="font-display text-lg font-semibold">{l.name}</h2>
            <p className="mt-2 text-sm text-ink-500">{l.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
