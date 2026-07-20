import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="container-page py-20 text-center">
      <h1 className="section-title">Плащането е отказано</h1>
      <p className="mt-3 text-ink-500">Можете да опитате отново от количката.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/cart" className="btn-primary">
          Към количката
        </Link>
        <Link href="/support" className="btn-secondary">
          Поддръжка
        </Link>
      </div>
    </div>
  );
}
