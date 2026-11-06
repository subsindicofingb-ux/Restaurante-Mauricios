import { restaurant } from "./config";
import type { AppState, Dish, Ingredient, Order, OrderItem } from "./types";

export function ingredientMap(ingredients: Ingredient[]) {
  return new Map(ingredients.map((item) => [item.id, item]));
}

export function lineCost(qty: number, wastePct: number, avgCost: number) {
  return qty * (1 + wastePct / 100) * avgCost;
}

export function dishBatchCost(dish: Dish, ingredients: Ingredient[]) {
  const map = ingredientMap(ingredients);
  return dish.lines.reduce((sum, line) => {
    const ingredient = map.get(line.ingredientId);
    if (!ingredient) return sum;
    return sum + lineCost(line.qty, line.wastePct, ingredient.avgCost);
  }, 0);
}

export function portionCost(dish: Dish, ingredients: Ingredient[]) {
  const portions = dish.portions > 0 ? dish.portions : 1;
  return dishBatchCost(dish, ingredients) / portions;
}

export function cmvPct(cost: number, price: number) {
  if (price <= 0) return 0;
  return (cost / price) * 100;
}

export function suggestedPrice(cost: number, target = restaurant.targetCmv) {
  if (target <= 0) return cost;
  return cost / target;
}

export function orderSubtotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
}

export function orderTotal(order: Order) {
  return orderSubtotal(order) + (order.fulfillment === "entrega" ? order.deliveryFee : 0);
}

export function isSale(order: Order) {
  return order.status !== "cancelado";
}

export function todayIso(date = new Date()) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isToday(iso: string, now = new Date()) {
  return iso.slice(0, 10) === todayIso(now);
}

export function itemFoodCost(item: OrderItem, dishes: Dish[], ingredients: Ingredient[]) {
  const dish = dishes.find((entry) => entry.id === item.dishId);
  if (!dish) return 0;
  return portionCost(dish, ingredients) * item.qty;
}

export function daySales(state: AppState, now = new Date()) {
  const orders = state.orders.filter((order) => isSale(order) && isToday(order.createdAt, now));
  const revenue = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const foodCost = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((inner, item) => inner + itemFoodCost(item, state.dishes, state.ingredients), 0),
    0,
  );
  const deliveryRevenue = orders
    .filter((order) => order.channel === "delivery")
    .reduce((sum, order) => sum + orderSubtotal(order), 0);
  return {
    orders,
    revenue,
    foodCost,
    cmv: cmvPct(foodCost, revenue),
    tickets: orders.length,
    avgTicket: orders.length ? revenue / orders.length : 0,
    keptFromMarketplace: deliveryRevenue * restaurant.marketplaceRate,
    byChannel: (["mesa", "balcao", "delivery"] as const).map((channel) => ({
      channel,
      total: orders.filter((order) => order.channel === channel).reduce((sum, order) => sum + orderTotal(order), 0),
      count: orders.filter((order) => order.channel === channel).length,
    })),
  };
}

export function consumptionToday(state: AppState, ingredientId: string, now = new Date()) {
  let used = 0;
  for (const order of state.orders) {
    if (!isSale(order) || !isToday(order.createdAt, now)) continue;
    for (const item of order.items) {
      if (!item.fired) continue;
      const dish = state.dishes.find((entry) => entry.id === item.dishId);
      if (!dish) continue;
      for (const line of dish.lines) {
        if (line.ingredientId !== ingredientId) continue;
        const portions = dish.portions > 0 ? dish.portions : 1;
        used += (line.qty * (1 + line.wastePct / 100) * item.qty) / portions;
      }
    }
  }
  return used;
}

export function stockNeed(dish: Dish, itemQty: number, ingredientId: string) {
  const line = dish.lines.find((entry) => entry.ingredientId === ingredientId);
  if (!line) return 0;
  const portions = dish.portions > 0 ? dish.portions : 1;
  return (line.qty * (1 + line.wastePct / 100) * itemQty) / portions;
}

export function cashDay(state: AppState, now = new Date()) {
  const paid = state.orders.filter((order) => order.payment === "pago" && order.status !== "cancelado" && isToday(order.updatedAt, now));
  const selling = state.orders.filter((order) => isSale(order) && isToday(order.createdAt, now));
  const revenue = paid.reduce((sum, order) => sum + orderTotal(order), 0);
  const methods = (["pix", "cartao", "dinheiro"] as const).map((method) => ({
    method,
    total: paid.filter((order) => order.payMethod === method).reduce((sum, order) => sum + orderTotal(order), 0),
  }));
  const tally = new Map<string, { name: string; qty: number; total: number }>();
  for (const order of selling) {
    for (const item of order.items) {
      const dish = state.dishes.find((entry) => entry.id === item.dishId);
      const row = tally.get(item.dishId) ?? { name: dish?.name ?? "Item", qty: 0, total: 0 };
      row.qty += item.qty;
      row.total += item.unitPrice * item.qty;
      tally.set(item.dishId, row);
    }
  }
  const best = [...tally.values()].sort((a, b) => b.qty - a.qty || b.total - a.total)[0] ?? null;
  const expenses = (state.expenses ?? []).filter((item) => isToday(item.createdAt, now));
  const withdrawals = (state.withdrawals ?? []).filter((item) => isToday(item.createdAt, now));
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const withdrawalTotal = withdrawals.reduce((sum, item) => sum + item.amount, 0);
  const cashSales = methods.find((item) => item.method === "dinheiro")?.total ?? 0;
  return {
    paid,
    revenue,
    tickets: paid.length,
    methods,
    best,
    expenses,
    withdrawals,
    expenseTotal,
    withdrawalTotal,
    cashSales,
    expectedCash: cashSales - expenseTotal - withdrawalTotal,
  };
}

export function deliveryFeeFor(subtotal: number, fulfillment: "entrega" | "retirada") {
  if (fulfillment === "retirada") return 0;
  if (subtotal >= restaurant.freeDeliveryFrom) return 0;
  return restaurant.deliveryFee;
}

export function etaLabel(order: Order, dishes: Dish[], now = Date.now()) {
  if (order.status === "cancelado") return "Cancelado";
  if (order.status === "entregue" || order.status === "fechado") {
    return order.fulfillment === "retirada" ? "Retirado" : "Entregue";
  }
  if (order.status === "saiu") return "Chegando em cerca de 15 min";
  if (order.status === "pronto") {
    return order.fulfillment === "retirada" ? "Pronto para retirar" : "Saindo para entrega";
  }
  const prep = Math.max(
    8,
    ...order.items.map((item) => dishes.find((dish) => dish.id === item.dishId)?.prepMinutes ?? 15),
  );
  const elapsed = Math.round((now - new Date(order.updatedAt).getTime()) / 60000);
  const left = Math.max(4, prep - elapsed);
  if (order.status === "preparo") return `Na cozinha · cerca de ${left} min`;
  return `Aguardando a casa · preparo de ${prep} min`;
}
