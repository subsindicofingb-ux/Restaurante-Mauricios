"use client";

import { useState } from "react";
import { MenuGrid, PageIntro } from "@/components/bits";
import { orderTotal } from "@/lib/calc";
import { clock, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

export default function BalcaoPage() {
  const store = useStore();
  const [name, setName] = useState("");
  const [lines, setLines] = useState<Record<string, number>>({});
  const [pay, setPay] = useState<PayMethod>("pix");
  const open = store.orders.filter((order) => order.channel === "balcao" && !["fechado", "cancelado", "entregue"].includes(order.status));

  function add(dishId: string) {
    setLines((current) => ({ ...current, [dishId]: (current[dishId] ?? 0) + 1 }));
  }

  const draft = Object.entries(lines).filter(([, qty]) => qty > 0);
  const total = draft.reduce((sum, [dishId, qty]) => {
    const dish = store.dishes.find((item) => item.id === dishId);
    return sum + (dish?.price ?? 0) * qty;
  }, 0);

  return (
    <div>
      <PageIntro
        kicker="Retirada rápida"
        title="Balcão"
        text="O pedido entra na cozinha no ato. Quando a praça marca pronto, o nome aparece aqui para chamar."
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="panel p-4">
          <MenuGrid channel="balcao" onPick={add} />
        </section>
        <div className="space-y-4">
          <section className="panel p-4">
            <h2 className="font-serif text-2xl">Comanda</h2>
            <input className="field mt-3" placeholder="Nome para chamar" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="mt-3 space-y-2 text-sm">
              {draft.length === 0 && <p className="text-muted">Toque um item do cardápio.</p>}
              {draft.map(([dishId, qty]) => {
                const dish = store.dishes.find((item) => item.id === dishId);
                return (
                  <div key={dishId} className="flex justify-between">
                    <span>
                      {qty}× {dish?.name}
                    </span>
                    <button className="text-terra" onClick={() => setLines({ ...lines, [dishId]: qty - 1 })}>
                      tirar
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 font-serif text-3xl">{money(total)}</div>
            <div className="mt-3 grid grid-cols-3 gap-2">
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
            <button
              className="btn btn-primary mt-3 w-full"
              disabled={!draft.length}
              onClick={() => {
                store.createOrder({
                  channel: "balcao",
                  fulfillment: "balcao",
                  customerName: name || "Balcão",
                  phone: "",
                  address: "",
                  notes: "",
                  payMethod: pay,
                  fire: true,
                  lines: draft.map(([dishId, qty]) => ({ dishId, qty, notes: "" })),
                });
                setLines({});
                setName("");
              }}
            >
              Enviar para a cozinha
            </button>
            <p className="mt-2 text-xs text-muted">O pagamento fecha quando o cliente retira. A cozinha já recebe o pedido.</p>
          </section>
          <section className="panel p-4">
            <h2 className="font-serif text-2xl">Na fila</h2>
            <div className="mt-3 space-y-2">
              {open.length === 0 && <p className="text-sm text-muted">Nenhum pedido de balcão em aberto.</p>}
              {open.map((order) => (
                <div key={order.id} className="rounded-2xl bg-paper px-3 py-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{order.customerName}</span>
                    <span className="text-xs text-muted">{clock(order.createdAt)}</span>
                  </div>
                  <div className="text-sm">{money(orderTotal(order))}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-terra">{order.status}</div>
                  <button
                    className="btn btn-primary mt-2 w-full"
                    onClick={() => store.payAndClose(order.id, order.payMethod ?? pay)}
                  >
                    {order.status === "pronto" ? "Entregar e receber" : "Receber agora"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
