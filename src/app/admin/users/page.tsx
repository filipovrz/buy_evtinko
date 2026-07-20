import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Потребители — Админ" };

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      company: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Потребители</h1>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50 text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Име</th>
              <th className="px-4 py-3 font-medium">Имейл</th>
              <th className="px-4 py-3 font-medium">Роля</th>
              <th className="px-4 py-3 font-medium">Поръчки</th>
              <th className="px-4 py-3 font-medium">Регистриран</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">{u.name || "—"}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={u.role === "ADMIN" ? "font-semibold text-accent" : ""}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(u.createdAt).toLocaleDateString("bg-BG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
