export const metadata = { title: "Поверителност" };

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="section-title">Политика за поверителност</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-ink-600">
        <p>
          Auctions Evtinko Ltd. обработва лични данни (име, имейл, данни за фактура) с цел
          изпълнение на поръчки и поддръжка на клиентите на buy-software.evtinko-bg.com.
        </p>
        <p>
          Платежните данни се обработват от съответните доставчици (Stripe, PayPal, ePay.bg) —
          ние не съхраняваме пълни номера на карти.
        </p>
        <p>
          Данните не се продават на трети страни. Можете да поискате достъп, корекция или
          изтриване чрез support@evtinko-bg.com.
        </p>
      </div>
    </div>
  );
}
