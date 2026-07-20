import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  Users,
  Settings,
  Ticket,
  MessageSquare,
} from "lucide-react";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Табло", icon: LayoutDashboard },
  { href: "/admin/products", label: "Продукти", icon: Package },
  { href: "/admin/orders", label: "Поръчки", icon: ShoppingBag },
  { href: "/admin/categories", label: "Категории", icon: Tags },
  { href: "/admin/coupons", label: "Промо кодове", icon: Ticket },
  { href: "/admin/users", label: "Потребители", icon: Users },
  { href: "/admin/messages", label: "Съобщения", icon: MessageSquare },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/login?callbackUrl=/admin");

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="border-b border-ink-200 bg-ink-950 text-white">
        <div className="container-page flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded bg-accent px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
              Admin
            </span>
            <span className="text-sm text-ink-300">Auctions Evtinko Ltd.</span>
          </div>
          <Link href="/" className="text-sm text-ink-300 hover:text-white">
            ← Към сайта
          </Link>
        </div>
      </div>
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-ink-100 bg-white p-3">
          <nav className="space-y-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-ink-950"
              >
                <item.icon className="h-4 w-4 text-ink-400" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
