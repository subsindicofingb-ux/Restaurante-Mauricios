"use client";

import { useState } from "react";
import { PageIntro } from "@/components/bits";
import { consumptionToday } from "@/lib/calc";
import { money, qty, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Ingredient, Unit } from "@/lib/types";

const units: Unit[] = ["kg", "g", "L", "ml", "un"];

export default function EstoquePage() {
  const store = useStore();
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...new Set(store.ingredients.map((item) => item.category))];
  const [draft, setDraft] = useState<Ingredient | null>(null);

  const list = store.ingredients.filter((item) => category === "Todos" || item.category === category);

  return (
    <div>
      <PageIntro
        kicker="Posição"
        title="Estoque vivo"
        text="A saída acontece quando a cozinha recebe o pedido, pela quantidade da ficha. A entrada, com custo médio, acontece na compra."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-3 py-1.5 text-sm ${category === item ? "bg-ink text-paper" : "bg-white"}`}
          >
            {item}
          </button>
        ))}
        <button
          className="btn btn-primary"
          onClick={() =>
            setDraft({
              id: uid("ing"),
              name: "",
              unit: "kg",
              category: "Mercearia",
              stock: 0,
              minStock: 0,
              avgCost: 0,
              supplierId: store.suppliers[0]?.id ?? "",
            })
          }
        >
          Novo insumo
        </button>
      </div>

      {draft && (
        <form
          className="panel mb-4 grid gap-3 p-4 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.name) return;
            store.saveIngredient(draft);
            setDraft(null);
          }}
        >
          <input className="field" placeholder="Nome" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input className="field" placeholder="Categoria" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <select className="field" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value as Unit })}>
            {units.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
          <input className="field" type="number" step="0.01" placeholder="Custo médio" value={draft.avgCost} onChange={(e) => setDraft({ ...draft, avgCost: Number(e.target.value) })} />
          <input className="field" type="number" step="0.01" placeholder="Estoque" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
          <input className="field" type="number" step="0.01" placeholder="Mínimo" value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value) })} />
          <select className="field" value={draft.supplierId} onChange={(e) => setDraft({ ...draft, supplierId: e.target.value })}>
            {store.suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary">Salvar insumo</button>
        </form>
      )}

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Insumo</th>
              <th className="px-4 py-3 font-medium">Posição</th>
              <th className="px-4 py-3 font-medium">Hoje</th>
              <th className="px-4 py-3 font-medium">Custo médio</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => {
              const used = consumptionToday(store, item.id);
              const low = item.stock < item.minStock;
              const width = Math.max(6, Math.min(100, (item.stock / Math.max(item.minStock * 2, item.stock, 1)) * 100));
              return (
                <tr key={item.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted">{item.category}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={low ? "font-medium text-terra" : ""}>{qty(item.stock, item.unit)}</div>
                    <div className="mt-1 h-1.5 w-28 rounded-full bg-line">
                      <div className={`h-full rounded-full ${low ? "bg-terra" : "bg-moss"}`} style={{ width: `${width}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{used ? qty(used, item.unit) : "—"}</td>
                  <td className="px-4 py-3">{money(item.avgCost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
