"use client";

import Link from "next/link";
import { PageIntro } from "@/components/bits";
import { etaLabel, orderTotal } from "@/lib/calc";
import { minutesAgo, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { Order, OrderStatus } from "@/lib/types";

const columns: { status: OrderStatus[]; title: string; action?: { label: string; next: OrderStatus } }[] = [
  { status: ["recebido"], title: "Aceitar", action: { label: "Aceitar e cozinhar", next: "preparo" } },
  { status: ["preparo"], title: "Cozinha" },
  { status: ["pronto"], title: "Pronto", action: { label: "Saiu para entrega", next: "saiu" } },
  { status: ["saiu"], title: "A caminho", action: { label: "Entregue", next: "entregue" } },
];

export default function DeliveryPage() {
  const store = useStore();
  const now = useNow();
  const live = store.orders.filter((order) => order.channel === "delivery" && !["cancelado", "fechado"].includes(order.status));

  function act(order: Order, next: OrderStatus) {
    if (order.status === "recebido" && next === "preparo") {
      store.fireOrder(order.id);
      return;
    }
    if (next === "entregue") {
      store.setOrderStatus(order.id, "entregue");
      if (order.payMethod) store.payAndClose(order.id, order.payMethod);
      return;
    }
    if (next === "saiu" && order.fulfillment === "retirada") {
      store.setOrderStatus(order.id, "entregue");
      return;
    }
    store.setOrderStatus(order.id, next);
  }

  return (
    <div>
      <PageIntro
        kicker="Canal da casa"
        title="Delivery sem pedágio."
        text="O cliente pede no cardápio da casa, acompanha o status de verdade e a cozinha recebe o mesmo tipo de comanda do salão. A comissão do marketplace fica no caixa."
      />
      <div className="grid gap-3 lg:grid-cols-4">
        {columns.map((column) => {
          const cards = live.filter((order) => column.status.includes(order.status));
          return (
            <section key={column.title} className="panel p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-serif text-2xl">{column.title}</h2>
                <span className="text-sm text-muted">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((order) => {
                  const age = minutesAgo(order.createdAt, now);
                  const urgent = order.status === "recebido" && age >= 3;
                  return (
                    <article key={order.id} className={`rounded-2xl p-3 ${urgent ? "bg-[#f6d7cc]" : "bg-paper"}`}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{order.code}</span>
                        <span className={urgent ? "text-terra" : "text-muted"}>{age} min</span>
                      </div>
                      <div className="mt-1 font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted">
                        {order.fulfillment === "retirada" ? "Retirada" : order.address}
                      </div>
                      <ul className="mt-2 text-sm">
                        {order.items.map((item) => {
                          const dish = store.dishes.find((entry) => entry.id === item.dishId);
                          return (
                            <li key={item.id}>
                              {item.qty}× {dish?.name}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-2 text-sm">{money(orderTotal(order))}</div>
                      <div className="mt-1 text-xs text-muted">{etaLabel(order, store.dishes, now)}</div>
                      <div className="mt-3 flex flex-col gap-2">
                        {column.action && order.status === "pronto" && order.fulfillment === "retirada" ? (
                          <button className="btn btn-primary" onClick={() => store.setOrderStatus(order.id, "entregue")}>
                            Cliente retirou
                          </button>
                        ) : (
                          column.action && (
                            <button className="btn btn-primary" onClick={() => act(order, column.action!.next)}>
                              {column.action.label}
                            </button>
                          )
                        )}
                        <Link href={`/pedido?code=${order.code}`} className="text-center text-xs underline-offset-4 hover:underline">
                          Ver como o cliente vê
                        </Link>
                        {order.status === "recebido" && (
                          <button className="btn btn-danger" onClick={() => store.cancelOrder(order.id)}>
                            Recusar
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
