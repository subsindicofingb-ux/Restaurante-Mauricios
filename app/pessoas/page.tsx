"use client";

import { useState } from "react";
import { PageIntro } from "@/components/bits";
import { phoneLabel } from "@/lib/format";
import { useStaffSession } from "@/lib/staff";
import { useStore } from "@/lib/store";
import type { HousePerson } from "@/lib/types";

export default function PessoasPage() {
  const store = useStore();
  const staff = useStaffSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<HousePerson["role"]>("funcionario");
  const people = store.people ?? [];
  const employees = people.filter((item) => item.role === "funcionario");
  const administrators = people.filter((item) => item.role === "administrador");
  if (staff.ready && staff.role && staff.role !== "admin") return null;

  return (
    <div>
      <PageIntro
        kicker="Administração"
        title="Pessoas da casa"
        text="Clientes entram pelo delivery. Funcionários e administradores ficam registrados aqui e também no banco."
      />
      <form
        className="panel p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (name.trim().length < 2) return;
          store.registerPerson({ name, phone, role });
          setName("");
          setPhone("");
        }}
      >
        <h2 className="font-serif text-2xl">Novo registro</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <label className="block text-sm font-medium">
            Nome
            <input className="field mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Celular
            <input className="field mt-1" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Função
            <select className="field mt-1" value={role} onChange={(e) => setRole(e.target.value as HousePerson["role"])}>
              <option value="funcionario">Funcionário</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>
        </div>
        <button className="btn btn-primary mt-4">Registrar</button>
      </form>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PersonList title="Funcionários" people={employees} />
        <PersonList title="Administradores" people={administrators} />
      </div>

      <section className="panel mt-4 p-5">
        <h2 className="font-serif text-2xl">Clientes</h2>
        <div className="mt-4 space-y-3">
          {store.customers.length === 0 && <p className="text-sm text-muted">Nenhum cliente cadastrado ainda.</p>}
          {store.customers.map((customer) => (
            <article key={customer.id} className="rounded-2xl bg-paper px-3 py-3 text-sm">
              <div className="font-medium">
                {customer.name} · {phoneLabel(customer.phone)}
              </div>
              <div className="text-muted">
                {[customer.street, customer.number, customer.neighborhood, customer.city, customer.cep].filter(Boolean).join(" · ") || customer.address || "Sem endereço"}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function PersonList({ title, people }: { title: string; people: HousePerson[] }) {
  return (
    <section className="panel p-5">
      <h2 className="font-serif text-2xl">{title}</h2>
      <div className="mt-4 space-y-2">
        {people.length === 0 && <p className="text-sm text-muted">Nenhum registro.</p>}
        {people.map((person) => (
          <div key={person.id} className="flex justify-between gap-3 text-sm">
            <span className="font-medium">{person.name}</span>
            <span className="text-muted">{person.phone ? phoneLabel(person.phone) : "Sem celular"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
