"use client";

import Link from "next/link";
import { PageIntro, Stat } from "@/components/bits";
import { cmvPct, daySales, portionCost } from "@/lib/calc";
import { restaurant } from "@/lib/config";
import { minutesAgo, money, pct } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";

export default function PainelPage() {
  const state = useStore();
  const now = useNow();
  const sales = daySales(state, new Date(now));
  const low = state.ingredients.filter((item) => item.stock < item.minStock);
  const risky = state.dishes
    .map((dish) => {
      const cost = portionCost(dish, state.ingredients);
      return { dish, cost, cmv: cmvPct(cost, dish.price) };
    })
    .filter((item) => item.cmv > restaurant.targetCmv * 100)
    .sort((a, b) => b.cmv - a.cmv);
  const waiting = state.orders.filter((order) => order.status === "recebido");
  const openFloor = state.tables.filter((table) => table.status === "ocupada" || table.status === "conta");

  return (
    <div>
      <PageIntro
        kicker="Hoje na casa"
        title="O lucro começa na ficha."
        text="Cada venda baixa o estoque pela receita, cada compra recalcula o custo médio e o CMV de todos os pratos. Salão, balcão e delivery entram na mesma cozinha."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Faturamento" value={money(sales.revenue)} hint={`${sales.tickets} pedidos no dia`} />
        <Stat
          label="CMV teórico"
          value={pct(sales.cmv)}
          hint={`Alvo ${pct(restaurant.targetCmv * 100)} · custo ${money(sales.foodCost)}`}
        />
        <Stat label="Ticket médio" value={money(sales.avgTicket)} hint="Salão, balcão e delivery" />
        <Stat
          label="Ficou na casa"
          value={money(sales.keptFromMarketplace)}
          hint={`Comissão de marketplace evitada (${pct(restaurant.marketplaceRate * 100)})`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Canais</h2>
            <span className="text-xs text-muted">{openFloor.length} mesas abertas</span>
          </div>
          <div className="space-y-3">
            {sales.byChannel.map((row) => {
              const width = sales.revenue ? (row.total / sales.revenue) * 100 : 0;
              const label = row.channel === "mesa" ? "Salão" : row.channel === "balcao" ? "Balcão" : "Delivery";
              return (
                <div key={row.channel}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>
                      {label} <span className="text-muted">· {row.count}</span>
                    </span>
                    <span className="font-medium">{money(row.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-line">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <Link href="/salao" className="btn btn-ghost">
              Salão
            </Link>
            <Link href="/cozinha" className="btn btn-ghost">
              Cozinha
            </Link>
            <Link href="/delivery" className="btn btn-primary">
              Delivery {waiting.length ? `(${waiting.length})` : ""}
            </Link>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="font-serif text-2xl">Aceite do delivery</h2>
          <p className="mt-1 text-sm text-muted">Pedido parado na fila é pedido que o cliente cancela.</p>
          <div className="mt-4 space-y-2">
            {waiting.length === 0 && <div className="text-sm text-muted">Nenhum pedido esperando aceite.</div>}
            {waiting.map((order) => {
              const age = minutesAgo(order.createdAt, now);
              return (
                <Link key={order.id} href="/delivery" className="block rounded-2xl bg-paper px-3 py-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {order.code} · {order.customerName}
                    </span>
                    <span className={age >= 3 ? "text-terra" : "text-muted"}>{age} min</span>
                  </div>
                  <div className="text-xs text-muted">{order.address}</div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl">CMV acima do alvo</h2>
            <Link href="/fichas" className="text-sm underline-offset-4 hover:underline">
              Abrir fichas
            </Link>
          </div>
          <div className="space-y-3">
            {risky.slice(0, 5).map((item) => (
              <div key={item.dish.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium">{item.dish.name}</div>
                  <div className="text-xs text-muted">
                    custo {money(item.cost)} · preço {money(item.dish.price)}
                  </div>
                </div>
                <div className="font-serif text-xl text-terra">{pct(item.cmv)}</div>
              </div>
            ))}
            {risky.length === 0 && <div className="text-sm text-muted">Todos os pratos estão dentro do alvo.</div>}
          </div>
        </section>
        <section className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl">Estoque curto</h2>
            <Link href="/compras" className="text-sm underline-offset-4 hover:underline">
              Lançar compra
            </Link>
          </div>
          <div className="space-y-3">
            {low.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted">
                    mínimo {item.minStock} {item.unit}
                  </div>
                </div>
                <div className="font-serif text-xl text-terra">
                  {item.stock} {item.unit}
                </div>
              </div>
            ))}
            {low.length === 0 && <div className="text-sm text-muted">Nenhum insumo abaixo do mínimo.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
