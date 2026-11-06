"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deliveryFeeFor, stockNeed } from "./calc";
import { fetchHouse, houseOnline, saveHouse, supabase } from "./remote";
import { seedState } from "./seed";
import type {
  AppState,
  Dish,
  Fulfillment,
  Ingredient,
  ItemStatus,
  Order,
  OrderChannel,
  OrderStatus,
  PayMethod,
  PurchaseItem,
} from "./types";
import { orderCode, round3, uid } from "./format";

const KEY = "mauricios-os-v1";

const blankState: AppState = {
  ingredients: [],
  suppliers: [],
  dishes: [],
  purchases: [],
  tables: [],
  orders: [],
};

function load(): AppState {
  if (typeof window === "undefined") return seedState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.dishes || !parsed.orders || !parsed.ingredients) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

function deduct(state: AppState, items: Order["items"]): AppState["ingredients"] {
  const next = state.ingredients.map((item) => ({ ...item }));
  for (const item of items) {
    const dish = state.dishes.find((entry) => entry.id === item.dishId);
    if (!dish) continue;
    for (const ingredient of next) {
      const need = stockNeed(dish, item.qty, ingredient.id);
      if (need) ingredient.stock = round3(ingredient.stock - need);
    }
  }
  return next;
}

function restore(state: AppState, items: Order["items"]) {
  const next = state.ingredients.map((item) => ({ ...item }));
  for (const item of items) {
    const dish = state.dishes.find((entry) => entry.id === item.dishId);
    if (!dish) continue;
    for (const ingredient of next) {
      const need = stockNeed(dish, item.qty, ingredient.id);
      if (need) ingredient.stock = round3(ingredient.stock + need);
    }
  }
  return next;
}

function withOrder(state: AppState, orderId: string, map: (order: Order) => Order): AppState {
  return {
    ...state,
    orders: state.orders.map((order) => (order.id === orderId ? map(order) : order)),
  };
}

function touch(order: Order, patch: Partial<Order>): Order {
  return { ...order, ...patch, updatedAt: new Date().toISOString() };
}

function promote(order: Order): Order {
  if (["saiu", "entregue", "fechado", "cancelado", "recebido", "aberto"].includes(order.status)) return order;
  const fired = order.items.filter((item) => item.fired);
  if (!fired.length) return order;
  if (fired.every((item) => item.status === "entregue")) return touch(order, { status: "entregue" });
  if (fired.every((item) => item.status === "pronto" || item.status === "entregue")) {
    return touch(order, { status: "pronto" });
  }
  return touch(order, { status: "preparo" });
}

interface Store extends AppState {
  ready: boolean;
  reset: () => void;
  saveIngredient: (ingredient: Ingredient) => void;
  saveDish: (dish: Dish) => void;
  receivePurchase: (input: { supplierId: string; invoice: string; items: PurchaseItem[] }) => void;
  openTable: (tableId: string) => string;
  requestBill: (tableId: string) => void;
  addItem: (orderId: string, dishId: string, notes?: string) => void;
  setItemQty: (orderId: string, itemId: string, qty: number) => void;
  fireOrder: (orderId: string) => void;
  setItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  payAndClose: (orderId: string, method: PayMethod) => void;
  cancelOrder: (orderId: string) => void;
  createOrder: (input: {
    channel: OrderChannel;
    fulfillment: Fulfillment;
    tableId?: string;
    customerName: string;
    phone: string;
    address: string;
    notes: string;
    payMethod: PayMethod | null;
    lines: { dishId: string; qty: number; notes: string }[];
    fire: boolean;
  }) => Order;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(blankState);
  const [ready, setReady] = useState(false);
  const lastSent = useRef("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (houseOnline) {
        const remote = await fetchHouse();
        if (cancel) return;
        if (remote) {
          lastSent.current = JSON.stringify(remote);
          setState(remote);
        } else {
          const seed = seedState();
          lastSent.current = JSON.stringify(seed);
          await saveHouse(seed);
          if (cancel) return;
          setState(seed);
        }
      } else {
        const local = load();
        lastSent.current = JSON.stringify(local);
        setState(local);
      }
      if (!cancel) setReady(true);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const body = JSON.stringify(state);
    if (body === lastSent.current) return;
    lastSent.current = body;
    localStorage.setItem(KEY, body);
    if (!houseOnline) return;
    const handle = window.setTimeout(() => {
      void saveHouse(state);
    }, 200);
    return () => window.clearTimeout(handle);
  }, [state, ready]);

  useEffect(() => {
    const client = supabase;
    if (!houseOnline || !client) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === KEY && event.newValue && event.newValue !== lastSent.current) {
          try {
            lastSent.current = event.newValue;
            setState(JSON.parse(event.newValue) as AppState);
          } catch {
            /* ignore broken snapshots */
          }
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }

    const apply = (next: AppState | null) => {
      if (!next) return;
      const body = JSON.stringify(next);
      if (body === lastSent.current) return;
      lastSent.current = body;
      setState(next);
    };

    const channel = client
      .channel("house-state")
      .on("postgres_changes", { event: "*", schema: "public", table: "house_state" }, (payload) => {
        const row = payload.new as { data?: AppState };
        apply(row?.data ?? null);
      })
      .subscribe();

    const poll = window.setInterval(() => {
      void fetchHouse().then(apply);
    }, 2000);

    return () => {
      window.clearInterval(poll);
      void client.removeChannel(channel);
    };
  }, []);

  const api = useMemo<Store>(() => {
    const createOrder: Store["createOrder"] = (input) => {
      const now = new Date().toISOString();
      const items = input.lines
        .filter((line) => line.qty > 0)
        .map((line) => {
          const dish = state.dishes.find((entry) => entry.id === line.dishId);
          return {
            id: uid("itm"),
            dishId: line.dishId,
            qty: line.qty,
            notes: line.notes,
            fired: input.fire,
            status: input.fire ? ("preparo" as const) : ("hold" as const),
            unitPrice: dish?.price ?? 0,
          };
        });
      const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
      const fulfillment = input.fulfillment;
      const order: Order = {
        id: uid("ord"),
        code: orderCode(),
        channel: input.channel,
        fulfillment,
        status: input.fire ? "preparo" : input.channel === "delivery" ? "recebido" : "aberto",
        tableId: input.tableId,
        customerName: input.customerName,
        phone: input.phone,
        address: input.address,
        notes: input.notes,
        items,
        payment: "pendente",
        payMethod: input.payMethod,
        deliveryFee:
          fulfillment === "entrega" || fulfillment === "retirada"
            ? deliveryFeeFor(subtotal, fulfillment)
            : 0,
        stockAppliedIds: input.fire ? items.map((item) => item.id) : [],
        createdAt: now,
        updatedAt: now,
      };
      setState((current) => {
        const base = input.fire ? { ...current, ingredients: deduct(current, items) } : current;
        return {
          ...base,
          orders: [order, ...base.orders],
          tables: input.tableId
            ? base.tables.map((table) =>
                table.id === input.tableId ? { ...table, status: "ocupada" } : table,
              )
            : base.tables,
        };
      });
      return order;
    };

    return {
      ...state,
      ready,
      reset: () => setState(seedState()),
      saveIngredient: (ingredient) =>
        setState((current) => ({
          ...current,
          ingredients: current.ingredients.some((item) => item.id === ingredient.id)
            ? current.ingredients.map((item) => (item.id === ingredient.id ? ingredient : item))
            : [ingredient, ...current.ingredients],
        })),
      saveDish: (dish) =>
        setState((current) => ({
          ...current,
          dishes: current.dishes.some((item) => item.id === dish.id)
            ? current.dishes.map((item) => (item.id === dish.id ? dish : item))
            : [dish, ...current.dishes],
        })),
      receivePurchase: (input) =>
        setState((current) => {
          const ingredients = current.ingredients.map((ingredient) => {
            const bought = input.items.filter((item) => item.ingredientId === ingredient.id && item.qty > 0);
            if (!bought.length) return ingredient;
            const qty = bought.reduce((sum, item) => sum + item.qty, 0);
            const spent = bought.reduce((sum, item) => sum + item.qty * item.unitCost, 0);
            const baseQty = Math.max(ingredient.stock, 0);
            const avg = baseQty + qty === 0 ? ingredient.avgCost : (baseQty * ingredient.avgCost + spent) / (baseQty + qty);
            return { ...ingredient, stock: round3(ingredient.stock + qty), avgCost: Math.round(avg * 100) / 100 };
          });
          return {
            ...current,
            ingredients,
            purchases: [
              {
                id: uid("pur"),
                supplierId: input.supplierId,
                invoice: input.invoice,
                createdAt: new Date().toISOString(),
                items: input.items.filter((item) => item.qty > 0),
              },
              ...current.purchases,
            ],
          };
        }),
      openTable: (tableId) => {
        const existing = state.orders.find(
          (order) => order.tableId === tableId && !["fechado", "cancelado"].includes(order.status),
        );
        if (existing) return existing.id;
        const order = createOrder({
          channel: "mesa",
          fulfillment: "mesa",
          tableId,
          customerName: `Mesa ${state.tables.find((table) => table.id === tableId)?.number ?? ""}`,
          phone: "",
          address: "",
          notes: "",
          payMethod: null,
          lines: [],
          fire: false,
        });
        return order.id;
      },
      requestBill: (tableId) =>
        setState((current) => ({
          ...current,
          tables: current.tables.map((table) => (table.id === tableId ? { ...table, status: "conta" } : table)),
        })),
      addItem: (orderId, dishId, notes = "") =>
        setState((current) =>
          withOrder(current, orderId, (order) => {
            const dish = current.dishes.find((entry) => entry.id === dishId);
            if (!dish) return order;
            const same = order.items.find((item) => item.dishId === dishId && !item.fired && item.notes === notes);
            const items = same
              ? order.items.map((item) => (item.id === same.id ? { ...item, qty: item.qty + 1 } : item))
              : [
                  ...order.items,
                  {
                    id: uid("itm"),
                    dishId,
                    qty: 1,
                    notes,
                    fired: false,
                    status: "hold" as const,
                    unitPrice: dish.price,
                  },
                ];
            return touch(order, { items });
          }),
        ),
      setItemQty: (orderId, itemId, qty) =>
        setState((current) =>
          withOrder(current, orderId, (order) =>
            touch(order, {
              items:
                qty <= 0
                  ? order.items.filter((item) => item.id !== itemId || item.fired)
                  : order.items.map((item) => (item.id === itemId && !item.fired ? { ...item, qty } : item)),
            }),
          ),
        ),
      fireOrder: (orderId) =>
        setState((current) => {
          const order = current.orders.find((entry) => entry.id === orderId);
          if (!order) return current;
          const pending = order.items.filter((item) => !item.fired);
          if (!pending.length) return current;
          const ingredients = deduct(current, pending);
          return {
            ...current,
            ingredients,
            orders: current.orders.map((entry) => {
              if (entry.id !== orderId) return entry;
              const items = entry.items.map((item) =>
                item.fired ? item : { ...item, fired: true, status: "preparo" as const },
              );
              return touch(entry, {
                items,
                status: "preparo",
                stockAppliedIds: [...entry.stockAppliedIds, ...pending.map((item) => item.id)],
              });
            }),
          };
        }),
      setItemStatus: (orderId, itemId, status) =>
        setState((current) =>
          withOrder(current, orderId, (order) =>
            promote(
              touch(order, {
                items: order.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
              }),
            ),
          ),
        ),
      setOrderStatus: (orderId, status) =>
        setState((current) =>
          withOrder(current, orderId, (order) => {
            const items =
              status === "pronto" || status === "saiu" || status === "entregue" || status === "fechado"
                ? order.items.map((item) =>
                    item.fired && item.status === "preparo" ? { ...item, status: "pronto" as const } : item,
                  )
                : order.items;
            return touch(order, { status, items });
          }),
        ),
      payAndClose: (orderId, method) =>
        setState((current) => {
          const order = current.orders.find((entry) => entry.id === orderId);
          if (!order) return current;
          const pending = order.items.filter((item) => !order.stockAppliedIds.includes(item.id));
          const next = { ...current, ingredients: deduct(current, pending) };
          return {
            ...withOrder(next, orderId, (entry) =>
              touch(entry, {
                status: "fechado",
                payment: "pago",
                payMethod: method,
                stockAppliedIds: entry.items.map((item) => item.id),
                items: entry.items.map((item) => ({ ...item, status: "entregue" as const, fired: true })),
              }),
            ),
            tables: order.tableId
              ? next.tables.map((table) => (table.id === order.tableId ? { ...table, status: "livre" } : table))
              : next.tables,
          };
        }),
      cancelOrder: (orderId) =>
        setState((current) => {
          const order = current.orders.find((entry) => entry.id === orderId);
          if (!order || order.status === "cancelado") return current;
          const fired = order.items.filter((item) => order.stockAppliedIds.includes(item.id));
          return {
            ...current,
            ingredients: restore(current, fired),
            tables: order.tableId
              ? current.tables.map((table) => (table.id === order.tableId ? { ...table, status: "livre" } : table))
              : current.tables,
            orders: current.orders.map((entry) =>
              entry.id === orderId ? touch(entry, { status: "cancelado", stockAppliedIds: [] }) : entry,
            ),
          };
        }),
      createOrder,
    };
  }, [state, ready]);

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Abrindo a casa…</div>;
  }

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore fora do provider");
  return ctx;
}
