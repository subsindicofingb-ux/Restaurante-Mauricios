"use client";

import { Fragment, useState } from "react";
import { PageIntro } from "@/components/bits";
import { consumptionToday } from "@/lib/calc";
import { money, qty, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Ingredient, Unit } from "@/lib/types";

const units: Unit[] = ["kg", "g", "L", "ml", "un"];

function blankIngredient(supplierId: string): Ingredient {
  return {
    id: uid("ing"),
    name: "",
    unit: "kg",
    category: "",
    stock: 0,
    minStock: 0,
    avgCost: 0,
    supplierId,
  };
}

export default function EstoquePage() {
  const store = useStore();
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...new Set(store.ingredients.map((item) => item.category).filter(Boolean))].sort((a, b) =>
    a === "Todos" ? -1 : b === "Todos" ? 1 : a.localeCompare(b, "pt-BR"),
  );
  const [draft, setDraft] = useState<Ingredient | null>(null);
  const [supplierName, setSupplierName] = useState("");

  const list = store.ingredients
    .filter((item) => category === "Todos" || item.category === category)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const correcting = draft ? store.ingredients.some((item) => item.id === draft.id) : false;

  function openIngredient(ingredient: Ingredient) {
    setDraft({ ...ingredient });
    setSupplierName(store.suppliers.find((item) => item.id === ingredient.supplierId)?.name ?? "");
  }

  return (
    <div>
      <PageIntro
        kicker="Posição"
        title="Estoque vivo"
        text="A lista segue a ordem alfabética. Corrigir abre logo abaixo do insumo, com o valor por unidade que já está na ficha técnica."
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
          onClick={() => {
            setDraft(blankIngredient(store.suppliers[0]?.id ?? ""));
            setSupplierName("");
          }}
        >
          Novo insumo
        </button>
      </div>

      {draft && !correcting && (
        <form
          className="panel mb-4 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!draft.name.trim()) return;
            store.saveIngredient({ ...draft, name: draft.name.trim(), category: draft.category.trim() || "Geral" }, supplierName);
            setDraft(null);
            setSupplierName("");
          }}
        >
          <div className="mb-3 font-serif text-2xl">Novo insumo</div>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="text-sm md:col-span-2">
              Nome
              <input className="field mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className="text-sm">
              Categoria
              <input className="field mt-1" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} placeholder="Carnes, hortifruti…" />
            </label>
            <label className="text-sm">
              Unidade
              <select className="field mt-1" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value as Unit })}>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Valor por unidade
              <input
                className="field mt-1"
                type="number"
                min={0}
                step="0.01"
                value={draft.avgCost}
                onChange={(e) => setDraft({ ...draft, avgCost: Number(e.target.value) })}
              />
              <span className="mt-1 block text-xs font-normal text-muted">Vem da ficha técnica. O mesmo número entra no CMV.</span>
            </label>
            <label className="text-sm">
              Estoque atual
              <input
                className="field mt-1"
                type="number"
                step="0.01"
                value={draft.stock}
                onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Estoque mínimo
              <input
                className="field mt-1"
                type="number"
                min={0}
                step="0.01"
                value={draft.minStock}
                onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value) })}
              />
            </label>
            <label className="text-sm">
              Fornecedor
              <input className="field mt-1" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} list="fornecedores" />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-primary">Salvar insumo</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setDraft(null);
                setSupplierName("");
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="panel overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-paper text-xs uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Insumo</th>
              <th className="px-4 py-3 font-medium">Posição</th>
              <th className="px-4 py-3 font-medium">Hoje</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={5}>
                  Nenhum insumo nesta lista. Cadastre o nome, a unidade e o valor.
                </td>
              </tr>
            )}
            {list.map((item) => {
              const used = consumptionToday(store, item.id);
              const low = item.stock < item.minStock;
              const width = Math.max(6, Math.min(100, (item.stock / Math.max(item.minStock * 2, item.stock, 1)) * 100));
              const supplier = store.suppliers.find((entry) => entry.id === item.supplierId);
              const open = draft?.id === item.id;
              return (
                <Fragment key={item.id}>
                <tr className="border-t border-line">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted">
                      {item.category}
                      {supplier ? ` · ${supplier.name}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={low ? "font-medium text-terra" : ""}>{qty(item.stock, item.unit)}</div>
                    <div className="mt-1 h-1.5 w-28 rounded-full bg-line">
                      <div className={`h-full rounded-full ${low ? "bg-terra" : "bg-moss"}`} style={{ width: `${width}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{used ? qty(used, item.unit) : "—"}</td>
                  <td className="px-4 py-3">
                    {money(item.avgCost)}
                    <span className="text-xs text-muted"> / {item.unit}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn btn-ghost" onClick={() => (open ? setDraft(null) : openIngredient(item))}>
                      {open ? "Fechar" : "Corrigir"}
                    </button>
                  </td>
                </tr>
                {open && draft && (
                  <tr className="border-t border-line bg-paper">
                    <td className="px-4 py-4" colSpan={5}>
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          if (!draft.name.trim()) return;
                          store.saveIngredient({ ...draft, name: draft.name.trim(), category: draft.category.trim() || "Geral" }, supplierName);
                          setDraft(null);
                          setSupplierName("");
                        }}
                      >
                        <div className="mb-3 font-serif text-2xl">Corrigir {item.name}</div>
                        <div className="grid gap-3 md:grid-cols-4">
                          <label className="block text-sm font-medium md:col-span-2">
                            Nome
                            <input className="field mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                          </label>
                          <label className="block text-sm font-medium">
                            Categoria
                            <input className="field mt-1" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
                          </label>
                          <label className="block text-sm font-medium">
                            Unidade
                            <select className="field mt-1" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value as Unit })}>
                              {units.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="block text-sm font-medium">
                            Valor por unidade
                            <input
                              className="field mt-1"
                              type="number"
                              min={0}
                              step="0.01"
                              value={draft.avgCost}
                              onChange={(e) => setDraft({ ...draft, avgCost: Number(e.target.value) })}
                            />
                            <span className="mt-1 block text-xs font-normal text-muted">Já vem da ficha técnica.</span>
                          </label>
                          <label className="block text-sm font-medium">
                            Estoque atual
                            <input className="field mt-1" type="number" step="0.01" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} />
                          </label>
                          <label className="block text-sm font-medium">
                            Estoque mínimo
                            <input className="field mt-1" type="number" min={0} step="0.01" value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: Number(e.target.value) })} />
                          </label>
                          <label className="block text-sm font-medium">
                            Fornecedor
                            <input className="field mt-1" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} list="fornecedores" />
                          </label>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <button className="btn btn-primary">Salvar correção</button>
                          <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <datalist id="fornecedores">
        {store.suppliers.map((supplier) => (
          <option key={supplier.id} value={supplier.name} />
        ))}
      </datalist>
    </div>
  );
}
