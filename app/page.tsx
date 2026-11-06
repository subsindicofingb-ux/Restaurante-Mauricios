"use client";

import { useState } from "react";
import Link from "next/link";
import { restaurant } from "@/lib/config";
import { useStaffSession } from "@/lib/staff";

export default function EntradaPage() {
  const staff = useStaffSession();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function enterStaff() {
    if (name.trim().length < 2) {
      setError("Informe o nome de quem está na equipe.");
      return;
    }
    if (pin.trim() !== restaurant.staffPin) {
      setError("Senha da equipe incorreta.");
      return;
    }
    staff.enter(name);
    window.location.assign("/painel");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <section className="panel flex flex-col p-6 md:p-8">
        <div className="kicker">Cliente</div>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Pedir em casa</h1>
        <p className="mt-3 text-sm text-muted">
          Cadastro, cardápio e pagamento do delivery. O pedido entra na cozinha da casa, sem marketplace.
        </p>
        <div className="mt-6 flex flex-1 items-end">
          <Link href="/pedir" className="btn btn-primary">
            Fazer o pedido
          </Link>
        </div>
      </section>

      <section className="panel p-6 md:p-8">
        <div className="kicker">Equipe</div>
        <h2 className="mt-2 font-serif text-4xl leading-tight">Acesso dos funcionários</h2>
        <p className="mt-3 text-sm text-muted">Salão, cozinha, balcão, delivery, estoque e compras.</p>
        {staff.name ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm">Você já entrou como {staff.name}.</p>
            <div className="flex flex-wrap gap-2">
              <Link href="/painel" className="btn btn-primary">
                Abrir a operação
              </Link>
              <button className="btn btn-ghost" onClick={staff.leave}>
                Sair
              </button>
            </div>
          </div>
        ) : (
          <form
            className="mt-6 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              enterStaff();
            }}
          >
            <label className="block text-sm font-medium">
              Nome
              <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="block text-sm font-medium">
              Senha da equipe
              <input
                className="field mt-1"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <p className="text-sm text-terra">{error}</p>}
            <button className="btn btn-primary">Entrar</button>
          </form>
        )}
      </section>
    </div>
  );
}
