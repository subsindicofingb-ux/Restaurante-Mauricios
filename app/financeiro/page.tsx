"use client";

import { useState } from "react";
import { PageIntro } from "@/components/bits";
import { cashDay, isToday } from "@/lib/calc";
import { payLabel } from "@/lib/config";
import { clock, money } from "@/lib/format";
import { useStaffSession } from "@/lib/staff";
import { useStore } from "@/lib/store";
import { useNow } from "@/lib/use-now";

const expenseCategories = ["Mercado", "Motoboy", "Limpeza", "Manutenção", "Outros"];

export default function FinanceiroPage() {
  const store = useStore();
  const staff = useStaffSession();
  const now = useNow();
  const day = cashDay(store, new Date(now));
  const closes = (store.cashCloses ?? []).filter((item) => isToday(item.createdAt, new Date(now)));
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [reason, setReason] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [counted, setCounted] = useState("");
  const [note, setNote] = useState("");
  const countedValue = Number(counted.replace(",", "."));
  const difference = Number.isFinite(countedValue) ? countedValue - day.expectedCash : 0;
  if (staff.ready && staff.role && staff.role !== "admin") return null;

  return (
    <div>
      <PageIntro
        kicker="Administração"
        title="Caixa do dia"
        text="Faturamento, o prato que mais saiu, despesas, retirada e o fechamento. A equipe de salão e o delivery não entram aqui."
      />

      <div className="grid gap-3 md:grid-cols-3">
        <article className="panel p-5 md:col-span-2">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Faturamento pago hoje</div>
          <div className="mt-2 font-serif text-5xl">{money(day.revenue)}</div>
          <div className="mt-2 text-sm text-muted">{day.tickets} contas recebidas</div>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {day.methods.map((item) => (
              <div key={item.method} className="rounded-2xl bg-paper px-3 py-3">
                <div className="text-xs text-muted">{payLabel[item.method]}</div>
                <div className="font-serif text-2xl">{money(item.total)}</div>
              </div>
            ))}
          </div>
        </article>
        <article className="panel p-5">
          <div className="text-xs uppercase tracking-[0.14em] text-muted">Item mais vendido</div>
          {day.best ? (
            <>
              <div className="mt-2 font-serif text-3xl leading-tight">{day.best.name}</div>
              <div className="mt-2 text-sm text-muted">
                {day.best.qty} pedidos · {money(day.best.total)}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Ainda não houve venda hoje.</p>
          )}
        </article>
      </div>

      <article className="panel mt-4 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-muted">Dinheiro no caixa</div>
            <div className="mt-1 font-serif text-4xl">{money(day.expectedCash)}</div>
          </div>
          <p className="max-w-sm text-sm text-muted">
            Dinheiro recebido {money(day.cashSales)}, menos despesas {money(day.expenseTotal)} e retiradas {money(day.withdrawalTotal)}. Pix e cartão não entram na gaveta.
          </p>
        </div>
      </article>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <form
          className="panel p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(expenseAmount.replace(",", "."));
            if (!description.trim() || !(amount > 0)) return;
            store.addExpense({ description, category, amount });
            setDescription("");
            setExpenseAmount("");
          }}
        >
          <h2 className="font-serif text-2xl">Despesa do dia</h2>
          <div className="mt-4 grid gap-3">
            <label className="block text-sm font-medium">
              O que foi
              <input className="field mt-1" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Gás, gelo, sacola…" />
            </label>
            <label className="block text-sm font-medium">
              Tipo
              <select className="field mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
                {expenseCategories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Valor
              <input className="field mt-1" inputMode="decimal" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} placeholder="0,00" />
            </label>
          </div>
          <button className="btn btn-primary mt-4">Lançar despesa</button>
          <div className="mt-4 space-y-2">
            {day.expenses.length === 0 && <p className="text-sm text-muted">Nenhuma despesa hoje.</p>}
            {day.expenses.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {item.description}
                  <span className="text-muted"> · {item.category} · {clock(item.createdAt)}</span>
                </span>
                <span className="font-medium">{money(item.amount)}</span>
              </div>
            ))}
          </div>
        </form>

        <form
          className="panel p-5"
          onSubmit={(event) => {
            event.preventDefault();
            const amount = Number(withdrawAmount.replace(",", "."));
            if (!reason.trim() || !(amount > 0)) return;
            store.addWithdrawal({ by: staff.name || "Administração", reason, amount });
            setReason("");
            setWithdrawAmount("");
          }}
        >
          <h2 className="font-serif text-2xl">Retirada do caixa</h2>
          <div className="mt-4 grid gap-3">
            <label className="block text-sm font-medium">
              Motivo
              <input className="field mt-1" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Sangria, pagamento de fornecedor…" />
            </label>
            <label className="block text-sm font-medium">
              Valor
              <input className="field mt-1" inputMode="decimal" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0,00" />
            </label>
          </div>
          <button className="btn btn-primary mt-4">Registrar retirada</button>
          <div className="mt-4 space-y-2">
            {day.withdrawals.length === 0 && <p className="text-sm text-muted">Nenhuma retirada hoje.</p>}
            {day.withdrawals.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {item.reason}
                  <span className="text-muted"> · {item.by} · {clock(item.createdAt)}</span>
                </span>
                <span className="font-medium">{money(item.amount)}</span>
              </div>
            ))}
          </div>
        </form>
      </div>

      <form
        className="panel mt-4 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!Number.isFinite(countedValue) || countedValue < 0 || counted.trim() === "") return;
          store.closeCash({ by: staff.name || "Administração", countedCash: countedValue, note });
          setCounted("");
          setNote("");
        }}
      >
        <h2 className="font-serif text-2xl">Fechamento de caixa</h2>
        <p className="mt-1 text-sm text-muted">Conte o dinheiro da gaveta e registre a diferença. O registro fica guardado no dia.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block text-sm font-medium">
            Contado na gaveta
            <input className="field mt-1" inputMode="decimal" value={counted} onChange={(e) => setCounted(e.target.value)} placeholder="0,00" />
          </label>
          <label className="block text-sm font-medium">
            Observação
            <input className="field mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Troco deixado para amanhã…" />
          </label>
          <button className="btn btn-primary">Fechar o caixa</button>
        </div>
        {counted.trim() !== "" && Number.isFinite(countedValue) && (
          <p className={`mt-3 text-sm ${difference === 0 ? "text-moss" : "text-terra"}`}>
            {difference === 0 ? "A gaveta fecha certinha." : `Diferença de ${money(difference)} em relação ao esperado.`}
          </p>
        )}
        <div className="mt-4 space-y-2">
          {closes.map((item) => (
            <div key={item.id} className="rounded-2xl bg-paper px-3 py-3 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-medium">
                  {clock(item.createdAt)} · {item.by}
                </span>
                <span>
                  esperado {money(item.expectedCash)} · contado {money(item.countedCash)}
                </span>
              </div>
              <div className="text-muted">
                Faturamento {money(item.revenue)}
                {item.note ? ` · ${item.note}` : ""}
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
