import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppState, Customer, HousePerson } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const houseOnline = Boolean(url && key);

export const supabase: SupabaseClient | null = houseOnline ? createClient(url as string, key as string) : null;

function isHouse(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const state = value as AppState;
  return Array.isArray(state.dishes) && Array.isArray(state.orders) && Array.isArray(state.ingredients);
}

export async function fetchHouse(): Promise<AppState | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("house_state").select("data").eq("id", 1).maybeSingle();
  if (error || !isHouse(data?.data)) return null;
  return data.data;
}

export async function saveHouse(state: AppState) {
  if (!supabase) return;
  const { error } = await supabase.from("house_state").upsert(
    { id: 1, data: state, updated_at: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (error) console.error(error.message);
  await saveDirectory(state);
}

function customerRow(customer: Customer) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    cep: customer.cep ?? "",
    street: customer.street ?? "",
    number: customer.number ?? "",
    complement: customer.complement ?? "",
    neighborhood: customer.neighborhood ?? "",
    city: customer.city ?? "",
    address: customer.address ?? "",
    password_hash: customer.passwordHash ?? "",
    created_at: customer.createdAt,
  };
}

export async function saveDirectory(state: Pick<AppState, "customers" | "people">) {
  if (!supabase) return;
  const customers = state.customers ?? [];
  const people = state.people ?? [];
  if (customers.length) {
    const { error } = await supabase.from("customers").upsert(customers.map(customerRow), { onConflict: "id" });
    if (error) console.error(error.message);
  }
  const employees = people.filter((person) => person.role === "funcionario").map(personRow);
  const administrators = people.filter((person) => person.role === "administrador").map(personRow);
  if (employees.length) {
    const { error } = await supabase.from("employees").upsert(employees, { onConflict: "id" });
    if (error) console.error(error.message);
  }
  if (administrators.length) {
    const { error } = await supabase.from("administrators").upsert(administrators, { onConflict: "id" });
    if (error) console.error(error.message);
  }
}

function personRow(person: HousePerson) {
  return { id: person.id, name: person.name, phone: person.phone ?? "", created_at: person.createdAt };
}
