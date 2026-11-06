"use client";

import Link from "next/link";

export default function EntradaPage() {
  return (
    <section className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
      <article className="panel p-6 md:p-10">
        <div className="kicker">Delivery</div>
        <h1 className="mt-2 font-serif text-4xl leading-tight">Pedir em casa</h1>
        <p className="mt-3 text-sm text-muted">
          Cadastre-se, escolha os pratos e a forma de pagamento. O pedido entra direto na cozinha.
        </p>
        <Link href="/pedir" className="btn btn-primary mt-8">
          Fazer o pedido
        </Link>
      </article>
      <article className="panel p-6 md:p-10">
        <div className="kicker">Casa</div>
        <h2 className="mt-2 font-serif text-4xl leading-tight">Administração</h2>
        <p className="mt-3 text-sm text-muted">
          Caixa, estoque, fichas, pessoas e a operação do salão. A senha abre só o que é da função.
        </p>
        <Link href="/acesso" className="btn btn-ghost mt-8">
          Entrar na administração
        </Link>
      </article>
    </section>
  );
}
