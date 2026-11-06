"use client";

import { useEffect, useState } from "react";
import { PageIntro } from "@/components/bits";
import { clock, money, uid } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { PurchaseItem } from "@/lib/types";

export default function ComprasPage() {
  const store = useStore();
  const [supplierId, setSupplierId] = useState(store.suppliers[0]?.id ?? "");
  const [invoice, setInvoice] = useState("");
  const [rows, setRows] = useState<PurchaseItem[]>([
    { ingredientId: store.ingredients[0]?.id ?? "", qty: 1, unitCost: store.ingredients[0]?.avgCost ?? 0 },
  ]);
  const [done, setDone] = useState("");

  useEffect(() => {
    const first = store.ingredients[0];
    if (first) {
      setRows((current) =>
        current.map((row) => (row.ingredientId ? row : { ...row, ingredientId: first.id, unitCost: first.avgCost })),
      );
    }
    if (store.suppliers[0]) setSupplierId((id) => id || store.suppliers[0].id);
  }, [store.ingredients, store.suppliers]);

  const total = rows.reduce((sum, row) => sum + row.qty * row.unitCost, 0);

  return (
    <div>
      <PageIntro
        kicker="Entrada"
        title="Compras"
        text="Receber a nota atualiza a quantidade e o custo médio ponderado. A ficha técnica passa a usar esse custo no mesmo instante."
      />
      <form
        className="panel p-5"
        onSubmit={(event) => {
          event.preventDefault();
          const items = rows.filter((row) => row.qty > 0 && row.ingredientId);
          if (!items.length) return;
          store.receivePurchase({ supplierId, invoice: invoice || `Recibo ${uid("nf").slice(-4)}`, items });
          setDone("Entrada lançada. O CMV das fichas já usa o custo novo.");
          setInvoice("");
        }}
      >
        <div className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]">
          <label className="block text-sm font-medium text-ink">
            Fornecedor
            <select className="field mt-1" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              {store.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-ink">
            Nota ou recibo
            <input className="field mt-1" value={invoice} onChange={(e) => setInvoice(e.target.value)} placeholder="NF 19020" />
          </label>
        </div>
        <div className="mt-4 space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[1.5fr_0.7fr_0.8fr]">
              <label className="block text-sm font-medium text-ink">
                Insumo
                <select
                  className="field mt-1"
                  value={row.ingredientId}
                  onChange={(e) => {
                    const ingredient = store.ingredients.find((item) => item.id === e.target.value);
                    setRows(rows.map((item, i) => (i === index ? { ...item, ingredientId: e.target.value, unitCost: ingredient?.avgCost ?? item.unitCost } : item)));
                  }}
                >
                  <option value="">Escolher</option>
                  {store.ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-ink">
                Quantidade
                <input
                  className="field mt-1"
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.qty}
                  onChange={(e) => setRows(rows.map((item, i) => (i === index ? { ...item, qty: Number(e.target.value) } : item)))}
                />
              </label>
              <label className="block text-sm font-medium text-ink">
                Valor (R$ por unidade)
                <input
                  className="field mt-1"
                  type="number"
                  min={0}
                  step="0.01"
                  value={row.unitCost}
                  onChange={(e) => setRows(rows.map((item, i) => (i === index ? { ...item, unitCost: Number(e.target.value) } : item)))}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setRows([...rows, { ingredientId: store.ingredients[0]?.id ?? "", qty: 1, unitCost: store.ingredients[0]?.avgCost ?? 0 }])}
          >
            Mais um item
          </button>
          <div className="flex items-center gap-4">
            <div className="font-serif text-3xl">{money(total)}</div>
            <button className="btn btn-primary">Dar entrada</button>
          </div>
        </div>
        {done && <p className="mt-3 text-sm text-moss">{done}</p>}
      </form>

      <section className="mt-4 space-y-3">
        {store.purchases.map((purchase) => {
          const supplier = store.suppliers.find((item) => item.id === purchase.supplierId);
          const sum = purchase.items.reduce((acc, item) => acc + item.qty * item.unitCost, 0);
          return (
            <article key={purchase.id} className="panel p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">{supplier?.name}</div>
                  <div className="text-xs text-muted">
                    {purchase.invoice} · {clock(purchase.createdAt)}
                  </div>
                </div>
                <div className="font-serif text-2xl">{money(sum)}</div>
              </div>
              <div className="mt-2 text-sm text-muted">
                {purchase.items
                  .map((item) => {
                    const ingredient = store.ingredients.find((entry) => entry.id === item.ingredientId);
                    return `${item.qty} ${ingredient?.unit ?? ""} ${ingredient?.name ?? "item"}`;
                  })
                  .join(" · ")}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
