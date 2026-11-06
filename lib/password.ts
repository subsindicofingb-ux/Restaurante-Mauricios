export async function hashPassword(phone: string, password: string) {
  const bytes = new TextEncoder().encode(`mauricios|${phone}|${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
