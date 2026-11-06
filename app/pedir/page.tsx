"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deliveryFeeFor } from "@/lib/calc";
import { restaurant } from "@/lib/config";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

export default function PedirPage() {
  const store = useStore();
  const router = useRouter();
  const menu = store.dishes.filter((dish) => dish.active && dish.channels.includes("delivery"));
  const categories = [...new Set(menu.map((dish) => dish.category))];
  const [qty, setQty] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfillment, setFulfillment] = useState<"entrega" | "retirada">("entrega");
  const [pay, setPay] = useState<PayMethod>("pix");
  const [placed, setPlaced] = useState<string | null>(null);

  useEffect(() => {
    if (placed) router.push(`/pedido?code=${placed}`);
  }, [placed, router]);

  const lines = Object.entries(qty).filter(([, count]) => count > 0);
  const subtotal = lines.reduce((sum, [id, count]) => sum + (store.dishes.find((dish) => dish.id === id)?.price ?? 0) * count, 0);
  const fee = deliveryFeeFor(subtotal, fulfillment);
  const prep = Math.max(8, ...lines.map(([id]) => store.dishes.find((dish) => dish.id === id)?.prepMinutes ?? 10));
  const marketplace = subtotal * restaurant.marketplaceRate;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <p className="kicker">Cardápio direto</p>
        <h1 className="mt-1 max-w-xl font-serif text-5xl tracking-tight">Peça na casa. A cozinha vê na hora.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          Sem fila de aplicativo, sem anúncio no meio do prato. Você acompanha o pedido com o código, do aceite até a porta.
          {fulfillment === "entrega" ? ` Entrega grátis a partir de ${money(restaurant.freeDeliveryFrom)}.` : " Retirada sem taxa."}
        </p>
        <div className="mt-6 space-y-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-3 font-serif text-2xl">{category}</h2>
              <div className="space-y-2">
                {menu
                  .filter((dish) => dish.category === category)
                  .map((dish) => (
                    <article key={dish.id} className="flex items-center justify-between gap-4 rounded-3xl bg-card px-4 py-4 shadow-card">
                      <div>
                        <h3 className="font-medium">{dish.name}</h3>
                        <p className="text-sm text-muted">{dish.description}</p>
                        <p className="mt-1 font-serif text-xl">{money(dish.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="h-9 w-9 rounded-full border border-line" onClick={() => setQty({ ...qty, [dish.id]: Math.max(0, (qty[dish.id] ?? 0) - 1) })}>
                          –
                        </button>
                        <span className="w-5 text-center">{qty[dish.id] ?? 0}</span>
                        <button className="h-9 w-9 rounded-full bg-ink text-paper" onClick={() => setQty({ ...qty, [dish.id]: (qty[dish.id] ?? 0) + 1 })}>
                          +
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-[28px] bg-ink p-5 text-paper lg:sticky lg:top-6">
        <div className="text-xs uppercase tracking-[0.16em] text-[#e0b497]">Seu pedido</div>
        <div className="mt-3 flex rounded-full bg-white/10 p-1 text-sm">
          {(["entrega", "retirada"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFulfillment(mode)}
              className={`flex-1 rounded-full py-2 ${fulfillment === mode ? "bg-paper text-ink" : ""}`}
            >
              {mode === "entrega" ? "Entrega" : "Retirada"}
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-sm">
          {lines.length === 0 && <p className="text-[#c8b8a4]">Escolha os pratos ao lado.</p>}
          {lines.map(([id, count]) => {
            const dish = store.dishes.find((item) => item.id === id);
            return (
              <div key={id} className="flex justify-between">
                <span>
                  {count}× {dish?.name}
                </span>
                <span>{money((dish?.price ?? 0) * count)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-[#c8b8a4]">
            <span>Entrega</span>
            <span>{fee === 0 ? "Grátis" : money(fee)}</span>
          </div>
          <div className="flex justify-between font-serif text-3xl">
            <span>Total</span>
            <span>{money(subtotal + fee)}</span>
          </div>
          <p className="text-xs leading-5 text-[#e0b497]">
            {lines.length ? `Preparo de cerca de ${prep} min, e o status anda de verdade até a porta.` : "O status anda de verdade, da cozinha até a porta."} Neste pedido a casa deixa de pagar cerca de {money(marketplace)} de comissão de aplicativo.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          <input className="field text-ink" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="field text-ink" placeholder="Celular" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {fulfillment === "entrega" && (
            <textarea className="field text-ink" rows={3} placeholder="Endereço, complemento e referência" value={address} onChange={(e) => setAddress(e.target.value)} />
          )}
          <input className="field text-ink" placeholder="Observação para a cozinha" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            {(["pix", "cartao", "dinheiro"] as PayMethod[]).map((method) => (
              <button key={method} onClick={() => setPay(method)} className={`rounded-full py-2 text-xs uppercase ${pay === method ? "bg-paper text-ink" : "bg-white/10"}`}>
                {method}
              </button>
            ))}
          </div>
          <button
            className="btn w-full bg-terra text-white hover:bg-[#a33e1b]"
            disabled={!lines.length || name.trim().length < 2 || (fulfillment === "entrega" && address.trim().length < 6)}
            onClick={() => {
              const order = store.createOrder({
                channel: "delivery",
                fulfillment,
                customerName: name.trim(),
                phone: phone.trim(),
                address: fulfillment === "entrega" ? address.trim() : "Retirada na casa",
                notes: notes.trim(),
                payMethod: pay,
                fire: false,
                lines: lines.map(([dishId, count]) => ({ dishId, qty: count, notes: "" })),
              });
              setPlaced(order.code);
            }}
          >
            Fazer pedido
          </button>
        </div>
      </aside>
    </div>
  );
}
