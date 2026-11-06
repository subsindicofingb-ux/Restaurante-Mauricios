import { digits } from "./format";

export interface DeliveryAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
}

export function emptyAddress(): DeliveryAddress {
  return { cep: "", street: "", number: "", complement: "", neighborhood: "", city: "" };
}

export function maskCep(value: string) {
  const clean = digits(value).slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function formatAddress(address: DeliveryAddress) {
  const line = [address.street.trim(), address.number.trim()].filter(Boolean).join(", ");
  const place = [address.complement.trim(), address.neighborhood.trim(), address.city.trim()].filter(Boolean);
  const cep = digits(address.cep);
  const cepLabel = cep.length === 8 ? `CEP ${maskCep(cep)}` : "";
  return [line, ...place, cepLabel].filter(Boolean).join(" — ");
}

export function addressReady(address: DeliveryAddress) {
  return digits(address.cep).length === 8 && address.street.trim().length > 1 && address.number.trim().length > 0 && address.neighborhood.trim().length > 1 && address.city.trim().length > 1;
}
