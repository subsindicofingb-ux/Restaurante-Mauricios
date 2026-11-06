"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bike,
  ChefHat,
  ClipboardList,
  Flame,
  LayoutDashboard,
  ShoppingBasket,
  Store,
  UtensilsCrossed,
  Warehouse,
} from "lucide-react";
import { restaurant } from "@/lib/config";
import { useClientSession } from "@/lib/session";
import { staffSignedIn, useStaffSession } from "@/lib/staff";
import { useStore } from "@/lib/store";

const groups = [
  {
    label: "Gestão",
    items: [
      { href: "/painel", label: "Painel", icon: LayoutDashboard },
      { href: "/fichas", label: "Fichas técnicas", icon: ClipboardList },
      { href: "/estoque", label: "Estoque", icon: Warehouse },
      { href: "/compras", label: "Compras", icon: ShoppingBasket },
    ],
  },
  {
    label: "Operação",
    items: [
      { href: "/salao", label: "Salão", icon: UtensilsCrossed },
      { href: "/cozinha", label: "Cozinha", icon: Flame },
      { href: "/balcao", label: "Balcão", icon: Store },
      { href: "/delivery", label: "Delivery", icon: Bike },
    ],
  },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useStore();
  const session = useClientSession();
  const staff = useStaffSession();
  const guest = pathname === "/" || pathname.startsWith("/pedir") || pathname.startsWith("/pedido");
  const account = store.customers.find((item) => item.id === session.id);
  const waiting = store.orders.filter((order) => order.status === "recebido").length;
  const kds = pathname === "/cozinha";

  useEffect(() => {
    if (guest || staff.name || staffSignedIn()) return;
    if (!staff.ready) return;
    router.replace("/");
  }, [staff.ready, staff.name, guest, router]);

  if (guest) {
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link href={pathname === "/" ? "/" : "/pedir"} className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-14 rounded-full bg-white shadow-card" />
            <span>
              <span className="block font-serif text-xl leading-none">{restaurant.name}</span>
              <span className="text-xs text-muted">{restaurant.tagline}</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {staff.name && pathname.startsWith("/pedir") && (
              <Link href="/painel" className="text-sm text-muted underline-offset-4 hover:underline">
                Equipe
              </Link>
            )}
            {account && pathname.startsWith("/pedir") && (
              <button onClick={session.leave} className="text-sm text-muted underline-offset-4 hover:underline">
                Sair · {account.name.split(" ")[0]}
              </button>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 pb-28 md:px-10">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[248px_1fr]">
      <aside className="hidden bg-side text-[#f3ecdf] md:flex md:flex-col">
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <img src="/logo.png" alt="" className="h-12 w-12 rounded-full bg-white" />
          <div>
            <div className="font-serif text-2xl leading-none">{restaurant.name}</div>
            <div className="mt-1 text-xs text-[#b7ab9c]">{restaurant.tagline}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-6 px-3">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-[#8d8274]">{group.label}</div>
              {group.items.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mb-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                      active ? "bg-[#f4efe6] text-ink" : "text-[#e7dfd2] hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/delivery" && waiting > 0 && (
                      <span className="rounded-full bg-terra px-2 py-0.5 text-[11px] text-white">{waiting}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
          <Link
            href="/pedir"
            className="mx-3 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2.5 text-sm text-[#f3ecdf] hover:bg-white/5"
          >
            <ChefHat size={16} />
            Cardápio do cliente
          </Link>
        </nav>
        <div className="m-4 space-y-1">
          <div className="px-3 text-xs text-[#b7ab9c]">{staff.name}</div>
          <button
            onClick={() => {
              staff.leave();
              router.push("/");
            }}
            className="w-full rounded-2xl px-3 py-2 text-left text-xs text-[#b7ab9c] hover:bg-white/5"
          >
            Sair da equipe
          </button>
          <button onClick={store.reset} className="w-full rounded-2xl px-3 py-2 text-left text-xs text-[#b7ab9c] hover:bg-white/5">
            Restaurar dados de demonstração
          </button>
        </div>
      </aside>
      {(!staff.ready || !staff.name) && (
        <div className="grid min-h-screen place-items-center text-sm text-muted">Abrindo a equipe…</div>
      )}
      {staff.name && (
      <div className="min-w-0">
        <div className="flex gap-2 overflow-x-auto border-b border-line bg-side px-3 py-3 text-[#f3ecdf] md:hidden">
          {groups.flatMap((group) => group.items).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${pathname === item.href ? "bg-paper text-ink" : ""}`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/pedir" className="shrink-0 rounded-full px-3 py-1.5 text-sm">
            Cardápio
          </Link>
        </div>
        <main className={kds ? "min-h-screen bg-[#12100e] text-[#f6f1e7]" : "min-h-screen"}>
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
      </div>
      )}
    </div>
  );
}
