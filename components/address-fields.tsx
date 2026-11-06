"use client";

import { useRef, useState } from "react";
import { maskCep, type DeliveryAddress } from "@/lib/address";
import { lookupCep } from "@/lib/cep";
import { digits } from "@/lib/format";

export function AddressFields({ value, onChange }: { value: DeliveryAddress; onChange: (next: DeliveryAddress) => void }) {
  const [status, setStatus] = useState("");
  const latest = useRef(value);
  latest.current = value;

  async function changeCep(raw: string) {
    const cep = maskCep(raw);
    const next = { ...latest.current, cep };
    onChange(next);
    if (digits(cep).length !== 8) {
      setStatus("");
      return;
    }
    setStatus("Buscando o CEP…");
    try {
      const found = await lookupCep(cep);
      if (!found) {
        setStatus("Não achamos esse CEP. Preencha a rua, o bairro e a cidade.");
        return;
      }
      onChange({ ...latest.current, ...found, cep: found.cep });
      setStatus("Rua, bairro e cidade preenchidos pelo CEP.");
    } catch {
      setStatus("Não foi possível consultar o CEP agora.");
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block text-sm font-medium">
        CEP
        <input className="field mt-1" inputMode="numeric" placeholder="00000-000" value={value.cep} onChange={(e) => void changeCep(e.target.value)} />
      </label>
      <label className="block text-sm font-medium">
        Número
        <input className="field mt-1" value={value.number} onChange={(e) => onChange({ ...value, number: e.target.value })} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Rua
        <input className="field mt-1" value={value.street} onChange={(e) => onChange({ ...value, street: e.target.value })} />
      </label>
      <label className="block text-sm font-medium">
        Bairro
        <input className="field mt-1" value={value.neighborhood} onChange={(e) => onChange({ ...value, neighborhood: e.target.value })} />
      </label>
      <label className="block text-sm font-medium">
        Cidade
        <input className="field mt-1" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} />
      </label>
      <label className="block text-sm font-medium sm:col-span-2">
        Complemento
        <input className="field mt-1" placeholder="Apto, bloco, referência" value={value.complement} onChange={(e) => onChange({ ...value, complement: e.target.value })} />
      </label>
      {status && <p className="text-sm text-muted sm:col-span-2">{status}</p>}
    </div>
  );
}
