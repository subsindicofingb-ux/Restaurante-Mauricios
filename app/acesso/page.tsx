"use client";

import { useState } from "react";
import Link from "next/link";
import { restaurant } from "@/lib/config";
import { useStaffSession, type StaffRole } from "@/lib/staff";
import { useStore } from "@/lib/store";

const home: Record<StaffRole, string> = {
  admin: "/painel",
  equipe: "/salao",
  delivery: "/delivery",
};

export default function AcessoPage() {
  const staff = useStaffSession();
  const store = useStore();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function enterStaff() {
    const role: StaffRole | null =
      pin.trim() === restaurant.adminPin ? "admin" : pin.trim() === restaurant.equipePin ? "equipe" : pin.trim() === restaurant.deliveryPin ? "delivery" : null;
    if (name.trim().length < 2) {
      setError("Informe o nome de quem está entrando.");
      return;
    }
    if (!role) {
      setError("Senha incorreta.");
      return;
    }
    staff.enter(name, role);
    store.registerPerson({ name, role: role === "admin" ? "administrador" : "funcionario" });
    window.location.assign(home[role]);
  }

  return (
    <section className="panel mx-auto max-w-md p-6 md:p-8">
      <div className="kicker">Casa</div>
      <h1 className="mt-2 font-serif text-4xl">Administração</h1>
      <p className="mt-3 text-sm text-muted">A senha abre só o que é da sua função.</p>
      {staff.name && staff.role ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm">
            {staff.name} já entrou como {staff.role === "admin" ? "administração" : staff.role === "delivery" ? "delivery" : "equipe"}.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href={home[staff.role]} className="btn btn-primary">
              Continuar
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
            Senha
            <input className="field mt-1" type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="text-sm text-terra">{error}</p>}
          <button className="btn btn-primary">Entrar</button>
        </form>
      )}
    </section>
  );
}
