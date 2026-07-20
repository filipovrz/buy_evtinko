"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ShoppingCart, User, Search, Shield, Heart } from "lucide-react";
import { cartCount, readCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useI18n } from "@/i18n/use-i18n";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);

  const nav = [
    { href: "/catalog", label: t.nav.catalog },
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/pricing", label: t.nav.licenses },
    { href: "/support", label: t.nav.support },
    { href: "/contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const sync = () => setCount(cartCount(readCart()));
    sync();
    window.addEventListener("cart-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("cart-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/90 text-white backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent text-sm font-bold shadow-lg shadow-brand-500/30">
            AE
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight group-hover:text-brand-200">
              Buy Software
            </span>
            <span className="hidden text-[10px] uppercase tracking-[0.16em] text-ink-400 sm:block">
              Auctions Evtinko Ltd.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-ink-300 transition hover:bg-white/5 hover:text-white",
                pathname.startsWith(item.href) && "bg-white/10 text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <CurrencySwitcher />
          <LanguageSwitcher />
          <Link
            href="/catalog"
            className="rounded-lg p-2 text-ink-300 hover:bg-white/5 hover:text-white"
            aria-label={t.nav.search}
          >
            <Search className="h-5 w-5" />
          </Link>
          {session?.user && (
            <Link
              href="/account/wishlist"
              className="rounded-lg p-2 text-ink-300 hover:bg-white/5 hover:text-white"
              aria-label={t.nav.wishlist}
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-ink-300 hover:bg-white/5 hover:text-white"
            aria-label={t.nav.cart}
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              className="rounded-lg p-2 text-ink-300 hover:bg-white/5 hover:text-white"
              aria-label={t.nav.account}
            >
              <User className="h-5 w-5" />
            </button>
            {accountOpen && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-ink-700 bg-ink-900 py-1 shadow-xl animate-fade-in">
                {session?.user ? (
                  <>
                    <div className="border-b border-ink-700 px-3 py-2">
                      <p className="truncate text-sm font-medium">{session.user.name || "User"}</p>
                      <p className="truncate text-xs text-ink-400">{session.user.email}</p>
                    </div>
                    <Link href="/account" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.myAccount}
                    </Link>
                    <Link href="/account/orders" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.ordersDownloads}
                    </Link>
                    <Link href="/account/wishlist" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.wishlist}
                    </Link>
                    <Link href="/account/password" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.changePassword}
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm text-accent-light hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                        <Shield className="h-4 w-4" /> {t.nav.admin}
                      </Link>
                    )}
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.login}
                    </Link>
                    <Link href="/register" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.register}
                    </Link>
                    <Link href="/forgot-password" className="block px-3 py-2 text-sm hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.forgotPassword}
                    </Link>
                    <Link href="/checkout" className="block px-3 py-2 text-sm text-accent-light hover:bg-white/5" onClick={() => setAccountOpen(false)}>
                      {t.nav.guestCheckout}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink-300 hover:bg-white/5 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-ink-950 px-4 py-3 lg:hidden animate-slide-in">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink-200 hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
