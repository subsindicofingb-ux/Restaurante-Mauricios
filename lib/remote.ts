import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppState } from "./types";

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
}
