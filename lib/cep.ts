import { maskCep, type DeliveryAddress } from "./address";
import { digits } from "./format";

export async function lookupCep(cep: string): Promise<Pick<DeliveryAddress, "cep" | "street" | "neighborhood" | "city"> | null> {
  const clean = digits(cep);
  if (clean.length !== 8) return null;
  const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!response.ok) return null;
  const data = (await response.json()) as { erro?: boolean; cep?: string; logradouro?: string; bairro?: string; localidade?: string };
  if (!data || data.erro) return null;
  return {
    cep: data.cep || maskCep(clean),
    street: data.logradouro ?? "",
    neighborhood: data.bairro ?? "",
    city: data.localidade ?? "",
  };
}
