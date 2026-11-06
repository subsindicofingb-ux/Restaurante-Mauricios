"use client";

import Link from "next/link";
import { useState } from "react";
import { stationLabel } from "@/lib/config";
import { minutesAgo } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { Station } from "@/lib/types";

const filters: Array<Station | "todas"> = ["todas", "grelha", "fogao", "frios", "bar", "doce"];

export default function CozinhaPage() {
  const store = useStore();
  const now = useNow(10000);
  const waiting = store.orders.filter((order) => order.status === "recebido").length;
  const [station, setStation] = useState<Station | "todas">("todas");

  const tickets = store.orders
    .filter((order) => !["cancelado", "fechado", "entregue"].includes(order.status))
    .map((order) => ({
      order,
      items: order.items.filter((item) => item.fired && item.status === "preparo"),
    }))
    .filter((ticket) => ticket.items.length)
    .sort((a, b) => new Date(a.order.createdAt).getTime() - new Date(b.order.createdAt).getTime());

  return (
    <div>
      <header className="mb-6 max-w-3xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e0b497]">KDS</div>
        <h1 className="mt-1 font-serif text-4xl tracking-tight text-[#f6f1e7] md:text-5xl">Uma cozinha, todos os canais.</h1>
        <p className="mt-2 text-sm leading-6 text-[#c8b8a4]">
          Salão, balcão e delivery caem na mesma fila. O cartão fica vermelho quando passa do tempo de preparo.
        </p>
      </header>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setStation(item)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              station === item ? "bg-[#f4efe6] text-ink" : "bg-white/10 text-[#f6f1e7]"
            }`}
          >
            {item === "todas" ? "Todas as praças" : stationLabel[item]}
          </button>
        ))}
      </div>
      {waiting > 0 && (
        <Link href="/delivery" className="mb-4 block rounded-2xl bg-terra px-4 py-3 text-sm text-white">
          {waiting} pedido{waiting > 1 ? "s" : ""} de delivery esperando aceite — ainda não entrou na cozinha.
        </Link>
      )}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tickets.map((ticket) => {
          const age = minutesAgo(ticket.order.createdAt, now);
          const slow = age >= 20;
          const where =
            ticket.order.channel === "mesa"
              ? `Mesa ${store.tables.find((table) => table.id === ticket.order.tableId)?.number ?? ""}`
              : ticket.order.channel === "balcao"
                ? `Balcão · ${ticket.order.customerName || ticket.order.code}`
                : `Delivery · ${ticket.order.customerName}`;
          const visible = ticket.items.filter((item) => {
            if (station === "todas") return true;
            return store.dishes.find((dish) => dish.id === item.dishId)?.station === station;
          });
          if (!visible.length) return null;
          return (
            <article key={ticket.order.id} className={`rounded-3xl p-4 ${slow ? "bg-[#3a1d16]" : "bg-[#221e1a]"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-[#e0b497]">{where}</div>
                  <div className="font-serif text-3xl">{ticket.order.code}</div>
                  {ticket.order.notes && <div className="mt-1 text-sm text-[#e0b497]">{ticket.order.notes}</div>}
                </div>
                <div className={`font-serif text-3xl ${slow ? "text-[#ffb4a2]" : ""}`}>{age}′</div>
              </div>
              <div className="mt-3 space-y-2">
                {visible.map((item) => {
                  const dish = store.dishes.find((entry) => entry.id === item.dishId);
                  return (
                    <div key={item.id} className="rounded-2xl bg-black/20 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg">
                            {item.qty}× {dish?.name}
                          </div>
                          <div className="text-xs text-[#c8b8a4]">
                            {dish ? stationLabel[dish.station] : ""} {item.notes ? `· ${item.notes}` : ""}
                          </div>
                        </div>
                        {item.status === "preparo" ? (
                          <button
                            className="rounded-full bg-[#f4efe6] px-3 py-2 text-sm font-medium text-ink"
                            onClick={() => store.setItemStatus(ticket.order.id, item.id, "pronto")}
                          >
                            Pronto
                          </button>
                        ) : (
                          <span className="rounded-full bg-moss px-3 py-2 text-xs text-white">na praça</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
      {tickets.length === 0 && <p className="text-[#c8b8a4]">Cozinha em dia. Nenhum item em preparo.</p>}
    </div>
  );
}
