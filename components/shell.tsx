"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChefHat,
  ClipboardList,
  Flame,
  LayoutDashboard,
  ShoppingBasket,
  Store,
  UtensilsCrossed,
  Wallet,
  Warehouse,
} from "lucide-react";
import { restaurant } from "@/lib/config";
import { useClientSession } from "@/lib/session";
import { staffSignedIn, useStaffSession } from "@/lib/staff";
import { useStore } from "@/lib/store";

const adminGroup = {
  label: "Administração",
  items: [
    { href: "/painel", label: "Painel", icon: LayoutDashboard },
    { href: "/financeiro", label: "Financeiro", icon: Wallet },
    { href: "/fichas", label: "Fichas técnicas", icon: ClipboardList },
    { href: "/estoque", label: "Estoque", icon: Warehouse },
    { href: "/compras", label: "Compras", icon: ShoppingBasket },
  ],
};

const floorGroup = {
  label: "Operação",
  items: [
    { href: "/salao", label: "Salão", icon: UtensilsCrossed },
    { href: "/cozinha", label: "Cozinha", icon: Flame },
    { href: "/balcao", label: "Balcão", icon: Store },
  ],
};

const adminPaths = new Set(adminGroup.items.map((item) => item.href));
const floorPaths = new Set(floorGroup.items.map((item) => item.href));

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const store = useStore();
  const session = useClientSession();
  const staff = useStaffSession();
  const customer = pathname === "/" || pathname.startsWith("/pedir") || pathname.startsWith("/pedido");
  const gate = pathname === "/acesso";
  const deliveryDesk = pathname === "/delivery";
  const account = store.customers.find((item) => item.id === session.id);
  const kds = pathname === "/cozinha";
  const groups = staff.role === "admin" ? [adminGroup, floorGroup] : [floorGroup];

  useEffect(() => {
    if (!staff.ready || customer) return;
    if (!staff.name && !staffSignedIn()) {
      if (!gate) router.replace("/acesso");
      return;
    }
    if (!staff.name || gate) return;
    if (staff.role === "delivery" && !deliveryDesk) router.replace("/delivery");
    if (staff.role === "equipe" && !floorPaths.has(pathname)) router.replace("/salao");
    if (staff.role !== "admin" && adminPaths.has(pathname)) router.replace(staff.role === "delivery" ? "/delivery" : "/salao");
  }, [staff.ready, staff.name, staff.role, customer, gate, deliveryDesk, pathname, router]);

  if (customer || gate) {
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-10">
          <Link href={pathname.startsWith("/pedir") || pathname.startsWith("/pedido") ? "/pedir" : "/"} className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-14 rounded-full bg-white shadow-card" />
            <span>
              <span className="block font-serif text-xl leading-none">{restaurant.name}</span>
              <span className="text-xs text-muted">{restaurant.tagline}</span>
            </span>
          </Link>
          {account && pathname.startsWith("/pedir") && (
            <button onClick={session.leave} className="text-sm text-muted underline-offset-4 hover:underline">
              Sair · {account.name.split(" ")[0]}
            </button>
          )}
        </header>
        <main className="mx-auto max-w-6xl px-5 pb-28 md:px-10">{children}</main>
      </div>
    );
  }

  if (deliveryDesk) {
    if (!staff.ready || !staff.name || staff.role === "equipe") {
      return <div className="grid min-h-screen place-items-center text-sm text-muted">Abrindo a entrega…</div>;
    }
    return (
      <div className="min-h-screen">
        <header className="flex items-center justify-between gap-4 px-5 py-4 md:px-10">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-14 w-14 rounded-full bg-white shadow-card" />
            <span>
              <span className="block font-serif text-xl leading-none">Entregas</span>
              <span className="text-xs text-muted">{staff.name}</span>
            </span>
          </div>
          <button
            onClick={() => {
              staff.leave();
              router.push("/");
            }}
            className="text-sm text-muted underline-offset-4 hover:underline"
          >
            Sair
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-5 pb-16 md:px-10">{children}</main>
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
            <div className="mt-1 text-xs text-[#b7ab9c]">{staff.role === "admin" ? "Administração" : "Equipe"}</div>
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
                  </Link>
                );
              })}
            </div>
          ))}
          {staff.role === "admin" && (
            <Link
              href="/pedir"
              className="mx-3 flex items-center gap-3 rounded-2xl border border-white/10 px-3 py-2.5 text-sm text-[#f3ecdf] hover:bg-white/5"
            >
              <ChefHat size={16} />
              Cardápio do cliente
            </Link>
          )}
        </nav>
        <div className="m-4 space-y-1">
          <div className="px-3 text-xs text-[#b7ab9c]">{staff.name}</div>
          <button
            onClick={() => {
              staff.leave();
              router.push("/acesso");
            }}
            className="w-full rounded-2xl px-3 py-2 text-left text-xs text-[#b7ab9c] hover:bg-white/5"
          >
            Sair
          </button>
          {staff.role === "admin" && (
            <button onClick={store.reset} className="w-full rounded-2xl px-3 py-2 text-left text-xs text-[#b7ab9c] hover:bg-white/5">
              Restaurar dados de demonstração
            </button>
          )}
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
          </div>
          <main className={kds ? "min-h-screen bg-[#12100e] text-[#f6f1e7]" : "min-h-screen"}>
            <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</div>
          </main>
        </div>
      )}
    </div>
  );
}
