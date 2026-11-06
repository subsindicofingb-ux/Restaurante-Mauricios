"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addressReady, emptyAddress, formatAddress, type DeliveryAddress } from "@/lib/address";
import { deliveryFeeFor } from "@/lib/calc";
import { payLabel, restaurant } from "@/lib/config";
import { AddressFields } from "@/components/address-fields";
import { digits, money, phoneLabel } from "@/lib/format";
import { hashPassword } from "@/lib/password";
import { menuCategories } from "@/lib/menu";
import { useClientSession } from "@/lib/session";
import { useStore } from "@/lib/store";
import type { PayMethod } from "@/lib/types";

const steps = [
  { id: "conta", label: "Cadastro" },
  { id: "cardapio", label: "Pedido" },
  { id: "pagamento", label: "Pagamento" },
] as const;

type Step = (typeof steps)[number]["id"];

const payCopy: Record<PayMethod, string> = {
  pix: "Pix na entrega ou na retirada.",
  cartao: "Máquina na entrega ou no balcão.",
  dinheiro: "Em espécie. Se precisar de troco, diga para quanto.",
};

export default function PedirPage() {
  const store = useStore();
  const session = useClientSession();
  const router = useRouter();
  const customer = store.customers.find((item) => item.id === session.id) ?? null;
  const menu = store.dishes.filter((dish) => dish.active && dish.channels.includes("delivery"));
  const [step, setStep] = useState<Step>("conta");
  const [mode, setMode] = useState<"cadastrar" | "entrar">("cadastrar");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [destination, setDestination] = useState<DeliveryAddress>(emptyAddress());
  const [accountError, setAccountError] = useState("");
  const [category, setCategory] = useState("Todos");
  const [query, setQuery] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [fulfillment, setFulfillment] = useState<"entrega" | "retirada">("entrega");
  const [notes, setNotes] = useState("");
  const [pay, setPay] = useState<PayMethod>("pix");
  const [changeFor, setChangeFor] = useState("");

  useEffect(() => {
    if (!session.ready) return;
    if (!customer) {
      setStep("conta");
      return;
    }
    setName(customer.name);
    setPhone(phoneLabel(customer.phone));
    setDestination({
      cep: customer.cep ?? "",
      street: customer.street ?? "",
      number: customer.number ?? "",
      complement: customer.complement ?? "",
      neighborhood: customer.neighborhood ?? "",
      city: customer.city ?? "",
    });
    setStep((current) => (current === "conta" ? "cardapio" : current));
    // Hidrata o formulário só quando a pessoa entra ou sai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.ready, customer?.id]);

  const lines = Object.entries(qty).filter(([, count]) => count > 0);
  const subtotal = lines.reduce((sum, [id, count]) => sum + (store.dishes.find((dish) => dish.id === id)?.price ?? 0) * count, 0);
  const fee = deliveryFeeFor(subtotal, fulfillment);
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return menu.filter((dish) => {
      const inCategory = category === "Todos" || dish.category === category;
      const matches = !text || dish.name.toLowerCase().includes(text);
      return inCategory && matches;
    });
  }, [menu, category, query]);
  const grouped = menuCategories.filter((item) => visible.some((dish) => dish.category === item));

  async function saveAccount() {
    const cleanPhone = digits(phone);
    const secret = password.trim();
    if (cleanPhone.length < 10) {
      setAccountError("Informe um celular com DDD.");
      return;
    }
    if (secret.length < 4) {
      setAccountError("A senha precisa ter pelo menos 4 caracteres.");
      return;
    }
    const found = store.customers.find((item) => item.phone === cleanPhone);
    const hash = await hashPassword(cleanPhone, secret);
    if (mode === "entrar") {
      if (!found) {
        setAccountError("Não achamos esse celular. Faça o cadastro para pedir.");
        setMode("cadastrar");
        return;
      }
      if (!found.passwordHash) {
        setAccountError("Esse cadastro ainda não tem senha. Use Cadastrar, com o mesmo nome, para criar uma.");
        setMode("cadastrar");
        return;
      }
      if (found.passwordHash !== hash) {
        setAccountError("Senha incorreta.");
        return;
      }
      session.enter(found.id);
      setAccountError("");
      setPassword("");
      setStep("cardapio");
      return;
    }
    if (name.trim().length < 2) {
      setAccountError("Informe o nome.");
      return;
    }
    if (secret !== confirmPassword.trim()) {
      setAccountError("As senhas não coincidem.");
      return;
    }
    if (found?.passwordHash) {
      setAccountError("Esse celular já tem senha. Entre em Já tenho cadastro.");
      setMode("entrar");
      return;
    }
    if (found && found.name.trim().toLocaleLowerCase("pt-BR") !== name.trim().toLocaleLowerCase("pt-BR")) {
      setAccountError("O nome não é o mesmo deste celular.");
      return;
    }
    const saved = store.registerCustomer({ name, phone: cleanPhone, passwordHash: hash, ...destination });
    session.enter(saved.id);
    setAccountError("");
    setPassword("");
    setConfirmPassword("");
    setStep("cardapio");
  }

  function place() {
    if (!customer) {
      setStep("conta");
      return;
    }
    const note = [notes.trim(), pay === "dinheiro" && changeFor.trim() ? `Troco para ${changeFor.trim()}` : ""].filter(Boolean).join(". ");
    const order = store.createOrder({
      channel: "delivery",
      fulfillment,
      customerName: customer.name,
      phone: customer.phone,
      address: fulfillment === "entrega" ? formatAddress(destination) : "Retirada na casa",
      notes: note,
      payMethod: pay,
      fire: false,
      lines: lines.map(([dishId, count]) => ({ dishId, qty: count, notes: "" })),
    });
    if (formatAddress(destination) !== customer.address) {
      store.registerCustomer({ name: customer.name, phone: customer.phone, ...destination });
    }
    router.push(`/pedido?code=${order.code}`);
  }

  if (!session.ready) return <p className="text-muted">Abrindo o cardápio…</p>;

  return (
    <div>
      <ol className="mb-6 flex gap-2">
        {steps.map((item, index) => {
          const locked = item.id !== "conta" && !customer;
          const current = step === item.id;
          return (
            <li key={item.id} className="flex-1">
              <button
                disabled={locked}
                onClick={() => setStep(item.id)}
                className={`w-full rounded-full px-3 py-2 text-sm ${current ? "bg-ink text-paper" : "bg-white text-muted"} disabled:opacity-40`}
              >
                {index + 1}. {item.label}
              </button>
            </li>
          );
        })}
      </ol>

      {step === "conta" && (
        <section className="mx-auto max-w-lg">
          <img src="/logo.png" alt="Mauricio's" className="mx-auto h-28 w-28 rounded-full bg-white shadow-card" />
          <h1 className="mt-4 text-center font-serif text-4xl tracking-tight">Seu acesso</h1>
          <p className="mt-2 text-center text-sm leading-6 text-muted">
            O cadastro fica na casa. A senha impede que outra pessoa entre só com o seu celular.
          </p>
          <div className="mt-6 flex rounded-full bg-white p-1 text-sm shadow-card">
            {(["cadastrar", "entrar"] as const).map((item) => (
              <button key={item} onClick={() => { setMode(item); setAccountError(""); }} className={`flex-1 rounded-full py-2 ${mode === item ? "bg-ink text-paper" : ""}`}>
                {item === "cadastrar" ? "Cadastrar" : "Já tenho cadastro"}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {mode === "cadastrar" && <input className="field" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
            <input className="field" placeholder="Celular com DDD" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            <input className="field" placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "cadastrar" ? "new-password" : "current-password"} />
            {mode === "cadastrar" && (
              <input className="field" placeholder="Confirmar senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            )}
            {mode === "cadastrar" && <AddressFields value={destination} onChange={setDestination} />}
            {accountError && <p className="text-sm text-terra">{accountError}</p>}
            <button className="btn btn-primary w-full" onClick={saveAccount}>
              {mode === "cadastrar" ? "Criar cadastro e ver o cardápio" : "Entrar"}
            </button>
          </div>
        </section>
      )}

      {step === "cardapio" && customer && (
        <div>
          <p className="kicker">{restaurant.tagline}</p>
          <h1 className="mt-1 font-serif text-5xl tracking-tight">Olá, {customer.name.split(" ")[0]}.</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">Escolha os pratos. O pagamento fica no passo seguinte.</p>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {["Todos", ...menuCategories].map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${category === item ? "bg-ink text-paper" : "bg-white"}`}>
                {item}
              </button>
            ))}
          </div>
          <input className="field mt-3" placeholder="Buscar no cardápio" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="mt-6 space-y-8">
            {grouped.map((group) => (
              <section key={group}>
                <h2 className="mb-3 font-serif text-2xl">{group}</h2>
                <div className="space-y-2">
                  {visible
                    .filter((dish) => dish.category === group)
                    .map((dish) => (
                      <article key={dish.id} className="flex items-center justify-between gap-4 rounded-3xl bg-card px-4 py-4 shadow-card">
                        <div>
                          <h3 className="font-medium">{dish.name}</h3>
                          {dish.description && <p className="text-sm text-muted">{dish.description}</p>}
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
            {grouped.length === 0 && <p className="text-muted">Nada com esse nome no cardápio.</p>}
          </div>
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur md:static md:mt-8 md:border-0 md:bg-transparent md:px-0 md:py-0">
            <button className="btn btn-primary w-full" disabled={!lines.length} onClick={() => setStep("pagamento")}>
              Ir para o pagamento · {lines.length ? money(subtotal) : "escolha um prato"}
            </button>
          </div>
        </div>
      )}

      {step === "pagamento" && customer && (
        <section className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            <p className="kicker">Como vai pagar</p>
            <h1 className="mt-1 font-serif text-4xl tracking-tight">Fechar o pedido</h1>
            <div className="mt-5 flex rounded-full bg-white p-1 text-sm shadow-card">
              {(["entrega", "retirada"] as const).map((modeName) => (
                <button key={modeName} onClick={() => setFulfillment(modeName)} className={`flex-1 rounded-full py-2 ${fulfillment === modeName ? "bg-ink text-paper" : ""}`}>
                  {modeName === "entrega" ? "Entrega" : "Retirada"}
                </button>
              ))}
            </div>
            {fulfillment === "entrega" && (
              <div className="mt-3">
                {!destination.street && customer.address && <p className="mb-2 text-sm text-muted">Endereço já salvo: {customer.address}</p>}
                <AddressFields value={destination} onChange={setDestination} />
              </div>
            )}
            <input className="field mt-3" placeholder="Observação para a cozinha" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="mt-4 grid gap-2">
              {(["pix", "cartao", "dinheiro"] as PayMethod[]).map((method) => (
                <button key={method} onClick={() => setPay(method)} className={`rounded-3xl px-4 py-4 text-left ${pay === method ? "bg-ink text-paper" : "bg-card shadow-card"}`}>
                  <span className="block font-medium">{payLabel[method]}</span>
                  <span className={`mt-1 block text-sm ${pay === method ? "text-[#e7dfd2]" : "text-muted"}`}>{payCopy[method]}</span>
                </button>
              ))}
            </div>
            {pay === "dinheiro" && <input className="field mt-3" placeholder="Troco para quanto?" value={changeFor} onChange={(e) => setChangeFor(e.target.value)} />}
          </div>
          <aside className="h-fit rounded-[28px] bg-ink p-5 text-paper lg:sticky lg:top-6">
            <div className="text-xs uppercase tracking-[0.16em] text-[#e0b497]">Resumo</div>
            <div className="mt-3 space-y-2 text-sm">
              {lines.map(([id, count]) => {
                const dish = store.dishes.find((item) => item.id === id);
                return (
                  <div key={id} className="flex justify-between gap-3">
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
                {fulfillment === "entrega" ? `Grátis a partir de ${money(restaurant.freeDeliveryFrom)}.` : "Retirada sem taxa."} Pagamento em {payLabel[pay]}.
              </p>
            </div>
            <button
              className="btn mt-4 w-full bg-terra text-white hover:bg-[#a33e1b]"
              disabled={!lines.length || (fulfillment === "entrega" && !addressReady(destination))}
              onClick={place}
            >
              Confirmar pedido
            </button>
            <button className="mt-3 w-full text-sm text-[#e7dfd2]" onClick={() => setStep("cardapio")}>
              Voltar ao cardápio
            </button>
          </aside>
        </section>
      )}
    </div>
  );
}
