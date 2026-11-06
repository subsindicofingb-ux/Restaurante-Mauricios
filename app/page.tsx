"use client";

import Link from "next/link";

export default function EntradaPage() {
  return (
    <section className="panel mx-auto max-w-xl p-6 md:p-10">
      <div className="kicker">Delivery</div>
      <h1 className="mt-2 font-serif text-4xl leading-tight">Pedir em casa</h1>
      <p className="mt-3 text-sm text-muted">
        Cadastre-se, escolha os pratos e a forma de pagamento. O pedido entra direto na cozinha.
      </p>
      <Link href="/pedir" className="btn btn-primary mt-8">
        Fazer o pedido
      </Link>
    </section>
  );
}
