export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function phoneLabel(value: string) {
  const d = digits(value);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value;
}

export function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function qty(value: number, unit?: string) {
  const digits = Math.abs(value) >= 10 ? 1 : 2;
  const n = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
  return unit ? `${n} ${unit}` : n;
}

export function pct(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function minutesAgo(iso: string, now = Date.now()) {
  return Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
}

export function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function orderCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}
