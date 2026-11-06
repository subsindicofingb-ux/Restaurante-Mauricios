"use client";

import { useMemo, useState } from "react";
import { CmvMeter, PageIntro } from "@/components/bits";
import { cmvPct, portionCost, suggestedPrice } from "@/lib/calc";
import { restaurant, stationLabel } from "@/lib/config";
import { money, pct, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Channel, Dish, RecipeLine, Station } from "@/lib/types";

const stations: Station[] = ["grelha", "fogao", "frios", "bar", "doce"];
const channels: Channel[] = ["salao", "balcao", "delivery"];

const blank = (): Dish => ({
  id: uid("dish"),
  name: "",
  category: "Grelhados",
  description: "",
  price: 0,
  portions: 1,
  prepMinutes: 15,
  station: "grelha",
  channels: ["salao", "balcao", "delivery"],
  active: true,
  lines: [],
});

export default function FichasPage() {
  const store = useStore();
  const [selected, setSelected] = useState(store.dishes[0]?.id ?? "");
  const [draft, setDraft] = useState<Dish | null>(null);
  const current = draft ?? store.dishes.find((dish) => dish.id === selected) ?? store.dishes[0];

  const cost = useMemo(() => (current ? portionCost(current, store.ingredients) : 0), [current, store.ingredients]);
  const cmv = current ? cmvPct(cost, current.price) : 0;
  const target = suggestedPrice(cost);

  function update(patch: Partial<Dish>) {
    if (!current) return;
    setDraft({ ...current, ...patch });
  }

  function updateLine(index: number, patch: Partial<RecipeLine>) {
    if (!current) return;
    update({ lines: current.lines.map((line, i) => (i === index ? { ...line, ...patch } : line)) });
  }

  if (!current) return null;

  return (
    <div>
      <PageIntro
        kicker="Engenharia de cardápio"
        title="Ficha técnica"
        text="A ficha é o contrato entre a cozinha e o caixa. O CMV usa o custo médio do estoque, com a perda de limpeza, e sugere o preço para o alvo da casa."
      />
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="panel max-h-[78vh] overflow-auto p-3">
          <button
            className="btn btn-primary mb-3 w-full"
            onClick={() => {
              const dish = blank();
              setDraft(dish);
              setSelected(dish.id);
            }}
          >
            Novo prato
          </button>
          {store.dishes.map((dish) => {
            const dishCost = portionCost(dish, store.ingredients);
            const dishCmv = cmvPct(dishCost, dish.price);
            return (
              <button
                key={dish.id}
                onClick={() => {
                  setSelected(dish.id);
                  setDraft(null);
                }}
                className={`mb-1 w-full rounded-2xl px-3 py-2 text-left ${
                  dish.id === current.id ? "bg-ink text-paper" : "hover:bg-paper"
                }`}
              >
                <div className="flex justify-between gap-2 text-sm">
                  <span>{dish.name}</span>
                  <span>{pct(dishCmv)}</span>
                </div>
                <div className={`text-xs ${dish.id === current.id ? "text-[#d9cfc2]" : "text-muted"}`}>
                  {money(dish.price)} · margem {money(dish.price - dishCost)}
                </div>
              </button>
            );
          })}
        </aside>

        <section className="panel p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              Prato
              <input className="field mt-1" value={current.name} onChange={(e) => update({ name: e.target.value })} />
            </label>
            <label className="text-sm">
              Categoria
              <input className="field mt-1" value={current.category} onChange={(e) => update({ category: e.target.value })} />
            </label>
            <label className="text-sm md:col-span-2">
              Descrição no cardápio
              <input
                className="field mt-1"
                value={current.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </label>
            <label className="text-sm">
              Preço de venda
              <input
                className="field mt-1"
                type="number"
                min={0}
                step="0.5"
                value={current.price}
                onChange={(e) => update({ price: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Rendimento (porções)
              <input
                className="field mt-1"
                type="number"
                min={1}
                value={current.portions}
                onChange={(e) => update({ portions: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Preparo (min)
              <input
                className="field mt-1"
                type="number"
                min={1}
                value={current.prepMinutes}
                onChange={(e) => update({ prepMinutes: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Praça
              <select
                className="field mt-1"
                value={current.station}
                onChange={(e) => update({ station: e.target.value as Station })}
              >
                {stations.map((station) => (
                  <option key={station} value={station}>
                    {stationLabel[station]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {channels.map((channel) => {
              const on = current.channels.includes(channel);
              return (
                <button
                  key={channel}
                  onClick={() =>
                    update({
                      channels: on ? current.channels.filter((item) => item !== channel) : [...current.channels, channel],
                    })
                  }
                  className={`rounded-full px-3 py-1.5 text-sm ${on ? "bg-moss text-white" : "bg-paper text-muted"}`}
                >
                  {channel === "salao" ? "Salão" : channel === "balcao" ? "Balcão" : "Delivery"}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 rounded-3xl bg-paper p-4 sm:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Custo da porção</div>
              <div className="font-serif text-3xl">{money(cost)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.14em] text-muted">Margem</div>
              <div className="font-serif text-3xl">{money(current.price - cost)}</div>
            </div>
            <div>
              <CmvMeter value={cmv} />
              <div className="mt-2 text-xs text-muted">
                Preço para CMV {pct(restaurant.targetCmv * 100)}: <strong>{money(target)}</strong>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-serif text-2xl">Insumos</h2>
              <button
                className="btn btn-ghost"
                onClick={() =>
                  update({
                    lines: [...current.lines, { ingredientId: store.ingredients[0]?.id ?? "", qty: 0.1, wastePct: 0 }],
                  })
                }
              >
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {store.ingredients.length === 0 && (
                <p className="rounded-2xl bg-paper px-3 py-3 text-sm text-muted">Cadastre o insumo no estoque, com unidade e valor, antes de colocar na ficha.</p>
              )}
              {current.lines.map((line, index) => {
                const ingredient = store.ingredients.find((item) => item.id === line.ingredientId);
                const lineValue = ingredient ? line.qty * (1 + line.wastePct / 100) * ingredient.avgCost : 0;
                return (
                  <div key={`${line.ingredientId}-${index}`} className="grid gap-2 rounded-2xl border border-line p-3 md:grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_auto]">
                    <label className="text-xs text-muted">
                      Insumo
                      <select
                        className="field mt-1"
                        value={line.ingredientId}
                        onChange={(e) => updateLine(index, { ingredientId: e.target.value })}
                      >
                        <option value="">Escolher</option>
                        {store.ingredients.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-xs text-muted">
                      Quantidade {ingredient ? `(${ingredient.unit})` : ""}
                      <input
                        className="field mt-1"
                        type="number"
                        min={0}
                        step="0.01"
                        value={line.qty}
                        onChange={(e) => updateLine(index, { qty: Number(e.target.value) })}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Perda %
                      <input
                        className="field mt-1"
                        type="number"
                        min={0}
                        step="1"
                        value={line.wastePct}
                        onChange={(e) => updateLine(index, { wastePct: Number(e.target.value) })}
                      />
                    </label>
                    <label className="text-xs text-muted">
                      Valor (R$ / {ingredient?.unit ?? "un"})
                      <input
                        className="field mt-1"
                        type="number"
                        min={0}
                        step="0.01"
                        value={ingredient?.avgCost ?? 0}
                        disabled={!ingredient}
                        onChange={(e) => {
                          if (!ingredient) return;
                          store.saveIngredient({ ...ingredient, avgCost: Number(e.target.value) });
                        }}
                      />
                    </label>
                    <div className="flex items-end justify-between gap-3 pb-2 text-sm">
                      <span>
                        <span className="block text-xs text-muted">Custo na porção</span>
                        {money(lineValue / (current.portions || 1))}
                      </span>
                      <button
                        className="text-terra"
                        onClick={() => update({ lines: current.lines.filter((_, i) => i !== index) })}
                      >
                        tirar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted">A quantidade é da receita inteira. O valor é o preço do insumo e vale também no estoque. O custo da porção já desconta o rendimento.</p>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              className="btn btn-primary"
              disabled={!current.name || current.price <= 0}
              onClick={() => {
                store.saveDish(current);
                setSelected(current.id);
                setDraft(null);
              }}
            >
              Salvar ficha
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => update({ active: !current.active })}
            >
              {current.active ? "Arquivar" : "Reativar"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
