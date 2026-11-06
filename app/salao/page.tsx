"use client";

import { useState } from "react";
import { MenuGrid, PageIntro } from "@/components/bits";
import { orderSubtotal, orderTotal } from "@/lib/calc";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

const statusLabel = {
  livre: "Livre",
  ocupada: "Ocupada",
  conta: "Conta",
  reservada: "Reserva",
};

export default function SalaoPage() {
  const store = useStore();
  const [tableId, setTableId] = useState(store.tables.find((table) => table.status === "ocupada")?.id ?? store.tables[0]?.id);
  const [pay, setPay] = useState<PayMethod>("pix");
  const table = store.tables.find((item) => item.id === tableId);
  const order = store.orders.find((item) => item.tableId === tableId && !["fechado", "cancelado"].includes(item.status));
  const areas = [...new Set(store.tables.map((item) => item.area))];

  return (
    <div>
      <PageIntro
        kicker="Garçom"
        title="Salão"
        text="Abre a mesa, lança a comanda e manda a praça. A cozinha só vê o que foi enviado. A conta libera a mesa."
      />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {areas.map((area) => (
            <section key={area}>
              <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{area}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {store.tables
                  .filter((item) => item.area === area)
                  .map((item) => {
                    const open = store.orders.find(
                      (entry) => entry.tableId === item.id && !["fechado", "cancelado"].includes(entry.status),
                    );
                    const tone =
                      item.status === "livre"
                        ? "bg-white"
                        : item.status === "conta"
                          ? "bg-[#f3e1c2]"
                          : item.status === "reservada"
                            ? "bg-[#efe7f4]"
                            : "bg-[#f6d7cc]";
                    return (
                      <button
                        key={item.id}
                        onClick={() => setTableId(item.id)}
                        className={`rounded-[28px] border px-4 py-4 text-left ${tone} ${
                          item.id === tableId ? "border-ink" : "border-transparent"
                        }`}
                      >
                        <div className="font-serif text-4xl leading-none">{item.number}</div>
                        <div className="mt-2 text-xs uppercase tracking-[0.14em]">{statusLabel[item.status]}</div>
                        <div className="text-sm text-muted">
                          {item.seats} lugares
                          {open ? ` · ${money(orderSubtotal(open))}` : ""}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
          {order && (
            <section className="panel p-4">
              <h2 className="mb-3 font-serif text-2xl">Lançar</h2>
              <MenuGrid channel="salao" onPick={(dishId) => store.addItem(order.id, dishId)} />
            </section>
          )}
        </div>

        <aside className="panel h-fit p-4 xl:sticky xl:top-6">
          <div className="text-xs uppercase tracking-[0.16em] text-muted">{table?.area}</div>
          <h2 className="font-serif text-4xl">Mesa {table?.number}</h2>
          {!order && (
            <button className="btn btn-primary mt-4 w-full" onClick={() => table && store.openTable(table.id)}>
              {table?.status === "reservada" ? "Sentou a reserva" : "Abrir mesa"}
            </button>
          )}
          {order && (
            <div className="mt-4 space-y-3">
              {order.items.length === 0 && <p className="text-sm text-muted">Comanda vazia.</p>}
              {order.items.map((item) => {
                const dish = store.dishes.find((entry) => entry.id === item.dishId);
                return (
                  <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                    <div>
                      <div className="font-medium">
                        {item.qty}× {dish?.name}
                      </div>
                      <div className="text-xs text-muted">
                        {!item.fired ? "Ainda não enviado" : item.status === "pronto" ? "Pronto na praça" : "Na cozinha"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{money(item.unitPrice * item.qty)}</div>
                      {!item.fired && (
                        <button className="text-xs text-terra" onClick={() => store.setItemQty(order.id, item.id, item.qty - 1)}>
                          tirar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex items-end justify-between border-t border-line pt-3">
                <span className="text-sm text-muted">Total</span>
                <span className="font-serif text-3xl">{money(orderTotal(order))}</span>
              </div>
              <button
                className="btn btn-primary w-full"
                disabled={!order.items.some((item) => !item.fired)}
                onClick={() => store.fireOrder(order.id)}
              >
                Enviar cozinha
              </button>
              <button className="btn btn-ghost w-full" onClick={() => table && store.requestBill(table.id)}>
                Pedir conta
              </button>
              <div className="grid grid-cols-3 gap-2">
                {(["pix", "cartao", "dinheiro"] as PayMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPay(method)}
                    className={`rounded-full py-2 text-xs uppercase ${pay === method ? "bg-ink text-paper" : "bg-paper"}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
              <button className="btn btn-ghost w-full" onClick={() => store.payAndClose(order.id, pay)}>
                Receber e liberar
              </button>
              <button className="btn btn-danger w-full" onClick={() => store.cancelOrder(order.id)}>
                Cancelar comanda
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
