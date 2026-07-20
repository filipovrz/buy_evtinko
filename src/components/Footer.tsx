"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/use-i18n";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-ink-200 bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-xl font-semibold text-white">Buy Software</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-brand-300">
            {t.common.company}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-400">{t.footer.blurb}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t.footer.shop}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:text-white">{t.nav.catalog}</Link></li>
            <li><Link href="/cart" className="hover:text-white">{t.nav.cart}</Link></li>
            <li><Link href="/checkout" className="hover:text-white">{t.nav.guestCheckout}</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">{t.nav.howItWorks}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t.footer.account}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-white">{t.nav.login}</Link></li>
            <li><Link href="/register" className="hover:text-white">{t.nav.register}</Link></li>
            <li><Link href="/account" className="hover:text-white">{t.nav.myAccount}</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">{t.account.orders}</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">{t.footer.info}</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/terms" className="hover:text-white">{t.footer.terms}</Link></li>
            <li><Link href="/privacy" className="hover:text-white">{t.footer.privacy}</Link></li>
            <li><Link href="/refunds" className="hover:text-white">{t.footer.refunds}</Link></li>
            <li><Link href="/contact" className="hover:text-white">{t.nav.contact}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-800">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {t.common.company}. {t.footer.rights}
          </p>
          <p>{t.footer.paymentsLine}</p>
        </div>
      </div>
    </footer>
  );
}
