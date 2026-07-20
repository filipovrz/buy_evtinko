import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Buy Software | Auctions Evtinko Ltd.",
    template: "%s | Auctions Evtinko Ltd.",
  },
  description:
    "Дигитален магазин за софтуер, апликации, приложения и файлове. Сигурно онлайн плащане и автоматично изтегляне. Auctions Evtinko Ltd.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://buy-software.evtinko-bg.com"
  ),
  openGraph: {
    title: "Buy Software | Auctions Evtinko Ltd.",
    description: "Купете софтуер и файлове онлайн — карта, PayPal, ePay.bg",
    siteName: "Buy Software — Auctions Evtinko Ltd.",
    locale: "bg_BG",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bg">
      <body className="flex min-h-screen flex-col antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
