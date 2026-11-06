"use client";

import { cmvPct, portionCost } from "@/lib/calc";
import { channelLabel, stationLabel } from "@/lib/config";
import { money, pct } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Channel, Dish } from "@/lib/types";

export function PageIntro({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <header className="mb-6 max-w-3xl">
      <div className="kicker">{kicker}</div>
      <h1 className="mt-1 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
      {text && <p className="mt-2 text-sm leading-6 text-muted">{text}</p>}
    </header>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="panel p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-2 font-serif text-3xl tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function CmvMeter({ value }: { value: number }) {
  const tone = value <= 32 ? "bg-moss" : value <= 38 ? "bg-gold" : "bg-terra";
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">CMV</span>
        <span className="font-medium">{pct(value)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <div className={`h-full ${tone}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export function DishFacts({ dish }: { dish: Dish }) {
  const { ingredients } = useStore();
  const cost = portionCost(dish, ingredients);
  const cmv = cmvPct(cost, dish.price);
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-medium">{dish.name}</div>
          <div className="text-xs text-muted">
            {stationLabel[dish.station]} · {money(dish.price)} · custo {money(cost)}
          </div>
        </div>
        <div className="font-serif text-xl">{money(dish.price - cost)}</div>
      </div>
      <CmvMeter value={cmv} />
    </div>
  );
}

export function MenuGrid({
  channel,
  onPick,
}: {
  channel: Channel;
  onPick: (dishId: string) => void;
}) {
  const { dishes } = useStore();
  const list = dishes.filter((dish) => dish.active && dish.channels.includes(channel));
  const categories = [...new Set(list.map((dish) => dish.category))];
  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <section key={category}>
          <h3 className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{category}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {list
              .filter((dish) => dish.category === category)
              .map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => onPick(dish.id)}
                  className="rounded-2xl border border-line bg-white px-3 py-3 text-left hover:border-ink"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium">{dish.name}</span>
                    <span className="font-serif">{money(dish.price)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {dish.description} · {channelLabel[channel]}
                  </div>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
