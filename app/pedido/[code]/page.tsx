"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { etaLabel, orderTotal } from "@/lib/calc";
import { restaurant } from "@/lib/config";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";
import type { Fulfillment, OrderStatus } from "@/lib/types";

const steps: Record<Exclude<Fulfillment, "mesa" | "balcao">, { id: OrderStatus; label: string }[]> = {
  entrega: [
    { id: "recebido", label: "Recebemos" },
    { id: "preparo", label: "Na cozinha" },
    { id: "pronto", label: "Pronto" },
    { id: "saiu", label: "A caminho" },
    { id: "entregue", label: "Entregue" },
  ],
  retirada: [
    { id: "recebido", label: "Recebemos" },
    { id: "preparo", label: "Na cozinha" },
    { id: "pronto", label: "Pode retirar" },
    { id: "entregue", label: "Retirado" },
  ],
};

export default function PedidoPage() {
  const params = useParams<{ code: string }>();
  const code = String(params.code || "").toUpperCase();
  const store = useStore();
  const now = useNow(5000);
  const order = store.orders.find((item) => item.code.toUpperCase() === code);

  if (!store.ready) return <p className="text-muted">Abrindo o pedido…</p>;
  if (!order || order.channel !== "delivery") {
    return (
      <div className="mx-auto max-w-lg py-16">
        <h1 className="font-serif text-4xl">Não achamos esse código.</h1>
        <p className="mt-2 text-muted">Confira as letras ou peça de novo no cardápio.</p>
        <Link href="/pedir" className="btn btn-primary mt-6">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const flow = steps[order.fulfillment === "retirada" ? "retirada" : "entrega"];
  const statusIndex = order.status === "fechado" ? flow.length - 1 : flow.findIndex((step) => step.id === order.status);
  const cancelled = order.status === "cancelado";

  return (
    <div className="mx-auto max-w-xl">
      <p className="kicker">{restaurant.name}</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">{order.code}</h1>
      <p className="mt-2 text-lg">{cancelled ? "Pedido cancelado pela casa." : etaLabel(order, store.dishes, now)}</p>
      <p className="text-sm text-muted">
        {order.customerName} · {order.fulfillment === "retirada" ? "Retirada" : order.address}
      </p>

      {!cancelled && (
        <ol className="mt-8 space-y-0">
          {flow.map((step, index) => {
            const done = statusIndex >= index;
            const current = statusIndex === index;
            return (
              <li key={step.id} className="grid grid-cols-[28px_1fr] gap-3">
                <div className="flex flex-col items-center">
                  <span className={`mt-1 h-3.5 w-3.5 rounded-full ${done ? "bg-terra" : "bg-line"} ${current ? "ring-4 ring-terra/20" : ""}`} />
                  {index < flow.length - 1 && <span className={`w-px flex-1 ${done ? "bg-terra" : "bg-line"}`} />}
                </div>
                <div className={`pb-6 ${current ? "font-medium" : "text-muted"}`}>{step.label}</div>
              </li>
            );
          })}
        </ol>
      )}

      <section className="panel p-5">
        {order.items.map((item) => {
          const dish = store.dishes.find((entry) => entry.id === item.dishId);
          return (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span>
                {item.qty}× {dish?.name}
              </span>
              <span>{money(item.unitPrice * item.qty)}</span>
            </div>
          );
        })}
        <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
          <span className="text-sm text-muted">{order.deliveryFee ? `com entrega ${money(order.deliveryFee)}` : "entrega grátis"}</span>
          <span className="font-serif text-3xl">{money(orderTotal(order))}</span>
        </div>
        <p className="mt-3 text-xs text-muted">
          Pagamento no {order.payMethod}. Esta página atualiza sozinha enquanto a cozinha mexe no pedido — abra a operação em outra aba para ver o status andar.
        </p>
      </section>
      <Link href="/pedir" className="mt-6 inline-block text-sm underline-offset-4 hover:underline">
        Fazer outro pedido
      </Link>
    </div>
  );
}
