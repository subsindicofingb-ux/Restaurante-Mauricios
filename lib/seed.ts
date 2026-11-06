import { stockNeed } from "./calc";
import type { AppState, Order } from "./types";

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function snapshot(): AppState {
  const opened = ago(22);
  const closedAt = ago(150);
  const routeAt = ago(11);
  const waiting = ago(4);

  const mesaOrder: Order = {
    id: "ord_mesa3",
    code: "MESA3",
    channel: "mesa",
    fulfillment: "mesa",
    status: "preparo",
    tableId: "tbl_3",
    customerName: "Mesa 3",
    phone: "",
    address: "",
    notes: "Ponto da picanha: mal passado",
    payment: "pendente",
    payMethod: null,
    deliveryFee: 0,
    stockAppliedIds: ["itm_picanha", "itm_cerveja"],
    createdAt: opened,
    updatedAt: opened,
    items: [
      {
        id: "itm_picanha",
        dishId: "dish_picanha",
        qty: 1,
        notes: "Mal passado",
        fired: true,
        status: "preparo",
        unitPrice: 96,
      },
      {
        id: "itm_cerveja",
        dishId: "dish_cerveja",
        qty: 1,
        notes: "",
        fired: true,
        status: "preparo",
        unitPrice: 14,
      },
    ],
  };

  const closedMesa: Order = {
    id: "ord_almoco",
    code: "H2KD",
    channel: "mesa",
    fulfillment: "mesa",
    status: "fechado",
    tableId: "tbl_1",
    customerName: "Mesa 1",
    phone: "",
    address: "",
    notes: "",
    payment: "pago",
    payMethod: "cartao",
    deliveryFee: 0,
    stockAppliedIds: ["itm_frango", "itm_batata", "itm_beer2"],
    createdAt: closedAt,
    updatedAt: ago(90),
    items: [
      { id: "itm_frango", dishId: "dish_frango", qty: 2, notes: "", fired: true, status: "entregue", unitPrice: 46 },
      { id: "itm_batata", dishId: "dish_batata", qty: 1, notes: "", fired: true, status: "entregue", unitPrice: 24 },
      { id: "itm_beer2", dishId: "dish_cerveja", qty: 2, notes: "", fired: true, status: "entregue", unitPrice: 14 },
    ],
  };

  const closedBalcao: Order = {
    id: "ord_balcao1",
    code: "BALC",
    channel: "balcao",
    fulfillment: "balcao",
    status: "fechado",
    customerName: "Ana",
    phone: "",
    address: "",
    notes: "",
    payment: "pago",
    payMethod: "pix",
    deliveryFee: 0,
    stockAppliedIds: ["itm_pudim", "itm_refri"],
    createdAt: ago(70),
    updatedAt: ago(55),
    items: [
      { id: "itm_pudim", dishId: "dish_pudim", qty: 1, notes: "", fired: true, status: "entregue", unitPrice: 18 },
      { id: "itm_refri", dishId: "dish_refri", qty: 1, notes: "", fired: true, status: "entregue", unitPrice: 8 },
    ],
  };

  const onRoute: Order = {
    id: "ord_route",
    code: "M7K2",
    channel: "delivery",
    fulfillment: "entrega",
    status: "saiu",
    customerName: "Maria Souza",
    phone: "11991234000",
    address: "Rua Harmonia, 420 — Vila Madalena",
    notes: "Interfone 12",
    payment: "pendente",
    payMethod: "pix",
    deliveryFee: 0,
    stockAppliedIds: ["itm_feijoada", "itm_refri2"],
    createdAt: ago(38),
    updatedAt: routeAt,
    items: [
      { id: "itm_feijoada", dishId: "dish_feijoada", qty: 1, notes: "", fired: true, status: "pronto", unitPrice: 54 },
      { id: "itm_refri2", dishId: "dish_refri", qty: 1, notes: "", fired: true, status: "pronto", unitPrice: 8 },
    ],
  };

  const incoming: Order = {
    id: "ord_wait",
    code: "Q4NP",
    channel: "delivery",
    fulfillment: "entrega",
    status: "recebido",
    customerName: "Pedro Lima",
    phone: "11988887777",
    address: "Rua Augusta, 1200, apto 42 — Consolação",
    notes: "Sem cebola",
    payment: "pendente",
    payMethod: "cartao",
    deliveryFee: 7.9,
    stockAppliedIds: [],
    createdAt: waiting,
    updatedAt: waiting,
    items: [
      { id: "itm_contra", dishId: "dish_contra", qty: 1, notes: "Sem cebola", fired: false, status: "hold", unitPrice: 68 },
      { id: "itm_beer3", dishId: "dish_cerveja", qty: 2, notes: "", fired: false, status: "hold", unitPrice: 14 },
    ],
  };

  return {
    suppliers: [
      { id: "sup_boi", name: "Frigorífico Boi Nobre", phone: "(11) 4002-1100", category: "Carnes" },
      { id: "sup_horti", name: "Hortifruti da Praça", phone: "(11) 3090-2200", category: "Hortifruti" },
      { id: "sup_bebidas", name: "Bebidas Central", phone: "(11) 3222-0188", category: "Bebidas" },
      { id: "sup_mercearia", name: "Atacado Serra", phone: "(11) 3331-9090", category: "Mercearia" },
    ],
    ingredients: [
      { id: "ing_picanha", name: "Picanha", unit: "kg", category: "Carnes", stock: 18.4, minStock: 6, avgCost: 64, supplierId: "sup_boi" },
      { id: "ing_contra", name: "Contrafilé", unit: "kg", category: "Carnes", stock: 11.2, minStock: 4, avgCost: 49, supplierId: "sup_boi" },
      { id: "ing_frango", name: "Peito de frango", unit: "kg", category: "Carnes", stock: 9.5, minStock: 3, avgCost: 16.9, supplierId: "sup_boi" },
      { id: "ing_costela", name: "Costela bovina", unit: "kg", category: "Carnes", stock: 7.8, minStock: 3, avgCost: 32, supplierId: "sup_boi" },
      { id: "ing_linguica", name: "Linguiça toscana", unit: "kg", category: "Carnes", stock: 4.2, minStock: 2, avgCost: 24, supplierId: "sup_boi" },
      { id: "ing_arroz", name: "Arroz", unit: "kg", category: "Mercearia", stock: 22, minStock: 8, avgCost: 6.4, supplierId: "sup_mercearia" },
      { id: "ing_feijao", name: "Feijão preto", unit: "kg", category: "Mercearia", stock: 14, minStock: 5, avgCost: 8.1, supplierId: "sup_mercearia" },
      { id: "ing_farofa", name: "Farinha de mandioca", unit: "kg", category: "Mercearia", stock: 6, minStock: 2, avgCost: 7.5, supplierId: "sup_mercearia" },
      { id: "ing_alho", name: "Alho", unit: "kg", category: "Hortifruti", stock: 1.2, minStock: 0.4, avgCost: 32, supplierId: "sup_horti" },
      { id: "ing_cebola", name: "Cebola", unit: "kg", category: "Hortifruti", stock: 8, minStock: 3, avgCost: 4.8, supplierId: "sup_horti" },
      { id: "ing_tomate", name: "Tomate", unit: "kg", category: "Hortifruti", stock: 2.1, minStock: 4, avgCost: 7.9, supplierId: "sup_horti" },
      { id: "ing_alface", name: "Alface crespa", unit: "un", category: "Hortifruti", stock: 6, minStock: 8, avgCost: 3.2, supplierId: "sup_horti" },
      { id: "ing_batata", name: "Batata", unit: "kg", category: "Hortifruti", stock: 15, minStock: 6, avgCost: 4.6, supplierId: "sup_horti" },
      { id: "ing_oleo", name: "Óleo de soja", unit: "L", category: "Mercearia", stock: 9, minStock: 3, avgCost: 8.9, supplierId: "sup_mercearia" },
      { id: "ing_cerveja", name: "Cerveja long neck", unit: "un", category: "Bebidas", stock: 48, minStock: 24, avgCost: 4.7, supplierId: "sup_bebidas" },
      { id: "ing_refri", name: "Refrigerante lata", unit: "un", category: "Bebidas", stock: 36, minStock: 18, avgCost: 2.8, supplierId: "sup_bebidas" },
      { id: "ing_leitecond", name: "Leite condensado", unit: "un", category: "Confeitaria", stock: 10, minStock: 4, avgCost: 6.4, supplierId: "sup_mercearia" },
      { id: "ing_leite", name: "Leite", unit: "L", category: "Laticínios", stock: 8, minStock: 4, avgCost: 4.9, supplierId: "sup_mercearia" },
      { id: "ing_ovo", name: "Ovo", unit: "un", category: "Mercearia", stock: 60, minStock: 24, avgCost: 0.85, supplierId: "sup_mercearia" },
      { id: "ing_pao", name: "Pão francês", unit: "un", category: "Padaria", stock: 40, minStock: 20, avgCost: 0.7, supplierId: "sup_mercearia" },
      { id: "ing_queijo", name: "Queijo mussarela", unit: "kg", category: "Laticínios", stock: 3.4, minStock: 1.5, avgCost: 39, supplierId: "sup_mercearia" },
    ],
    dishes: [
      {
        id: "dish_picanha",
        name: "Picanha na brasa",
        category: "Grelhados",
        description: "400 g, arroz, feijão e farofa.",
        price: 96,
        portions: 1,
        prepMinutes: 25,
        station: "grelha",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_picanha", qty: 0.4, wastePct: 8 },
          { ingredientId: "ing_arroz", qty: 0.15, wastePct: 0 },
          { ingredientId: "ing_feijao", qty: 0.12, wastePct: 0 },
          { ingredientId: "ing_farofa", qty: 0.04, wastePct: 0 },
          { ingredientId: "ing_alho", qty: 0.01, wastePct: 0 },
          { ingredientId: "ing_oleo", qty: 0.02, wastePct: 0 },
        ],
      },
      {
        id: "dish_contra",
        name: "Contrafilé acebolado",
        category: "Grelhados",
        description: "280 g, cebola salteada, arroz.",
        price: 68,
        portions: 1,
        prepMinutes: 20,
        station: "grelha",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_contra", qty: 0.28, wastePct: 6 },
          { ingredientId: "ing_cebola", qty: 0.08, wastePct: 5 },
          { ingredientId: "ing_arroz", qty: 0.15, wastePct: 0 },
          { ingredientId: "ing_alho", qty: 0.008, wastePct: 0 },
          { ingredientId: "ing_oleo", qty: 0.015, wastePct: 0 },
        ],
      },
      {
        id: "dish_frango",
        name: "Frango grelhado",
        category: "Grelhados",
        description: "Peito, arroz e salada.",
        price: 46,
        portions: 1,
        prepMinutes: 18,
        station: "grelha",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_frango", qty: 0.28, wastePct: 5 },
          { ingredientId: "ing_arroz", qty: 0.15, wastePct: 0 },
          { ingredientId: "ing_alface", qty: 0.15, wastePct: 8 },
          { ingredientId: "ing_tomate", qty: 0.08, wastePct: 6 },
        ],
      },
      {
        id: "dish_feijoada",
        name: "Feijoada completa",
        category: "Panelas",
        description: "Costela, linguiça, arroz e farofa.",
        price: 54,
        portions: 1,
        prepMinutes: 15,
        station: "fogao",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_costela", qty: 0.18, wastePct: 4 },
          { ingredientId: "ing_linguica", qty: 0.08, wastePct: 2 },
          { ingredientId: "ing_feijao", qty: 0.22, wastePct: 0 },
          { ingredientId: "ing_arroz", qty: 0.15, wastePct: 0 },
          { ingredientId: "ing_farofa", qty: 0.05, wastePct: 0 },
          { ingredientId: "ing_alho", qty: 0.012, wastePct: 0 },
          { ingredientId: "ing_cebola", qty: 0.04, wastePct: 4 },
        ],
      },
      {
        id: "dish_salada",
        name: "Salada da casa",
        category: "Frios",
        description: "Alface, tomate e cebola.",
        price: 29,
        portions: 1,
        prepMinutes: 8,
        station: "frios",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_alface", qty: 0.4, wastePct: 10 },
          { ingredientId: "ing_tomate", qty: 0.12, wastePct: 8 },
          { ingredientId: "ing_cebola", qty: 0.03, wastePct: 0 },
        ],
      },
      {
        id: "dish_batata",
        name: "Batata frita",
        category: "Acompanhamentos",
        description: "Porção crocante.",
        price: 24,
        portions: 1,
        prepMinutes: 12,
        station: "fogao",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_batata", qty: 0.25, wastePct: 12 },
          { ingredientId: "ing_oleo", qty: 0.05, wastePct: 0 },
        ],
      },
      {
        id: "dish_pao",
        name: "Pão de alho",
        category: "Acompanhamentos",
        description: "Duas unidades com queijo.",
        price: 16,
        portions: 1,
        prepMinutes: 10,
        station: "grelha",
        channels: ["salao", "balcao"],
        active: true,
        lines: [
          { ingredientId: "ing_pao", qty: 2, wastePct: 0 },
          { ingredientId: "ing_alho", qty: 0.015, wastePct: 0 },
          { ingredientId: "ing_oleo", qty: 0.01, wastePct: 0 },
          { ingredientId: "ing_queijo", qty: 0.04, wastePct: 0 },
        ],
      },
      {
        id: "dish_cerveja",
        name: "Cerveja long neck",
        category: "Bebidas",
        description: "Gelada.",
        price: 14,
        portions: 1,
        prepMinutes: 2,
        station: "bar",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [{ ingredientId: "ing_cerveja", qty: 1, wastePct: 0 }],
      },
      {
        id: "dish_refri",
        name: "Refrigerante lata",
        category: "Bebidas",
        description: "Lata 350 ml.",
        price: 8,
        portions: 1,
        prepMinutes: 1,
        station: "bar",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [{ ingredientId: "ing_refri", qty: 1, wastePct: 0 }],
      },
      {
        id: "dish_pudim",
        name: "Pudim de leite",
        category: "Sobremesas",
        description: "Fatia da casa.",
        price: 18,
        portions: 1,
        prepMinutes: 4,
        station: "doce",
        channels: ["salao", "balcao", "delivery"],
        active: true,
        lines: [
          { ingredientId: "ing_leitecond", qty: 0.5, wastePct: 0 },
          { ingredientId: "ing_leite", qty: 0.15, wastePct: 0 },
          { ingredientId: "ing_ovo", qty: 2, wastePct: 0 },
        ],
      },
    ],
    purchases: [
      {
        id: "pur_1",
        supplierId: "sup_boi",
        createdAt: ago(60 * 26),
        invoice: "NF 18442",
        items: [
          { ingredientId: "ing_picanha", qty: 12, unitCost: 63.5 },
          { ingredientId: "ing_contra", qty: 8, unitCost: 48.2 },
        ],
      },
    ],
    tables: [
      { id: "tbl_1", number: 1, seats: 2, area: "Salão", status: "livre" },
      { id: "tbl_2", number: 2, seats: 2, area: "Salão", status: "livre" },
      { id: "tbl_3", number: 3, seats: 4, area: "Salão", status: "ocupada" },
      { id: "tbl_4", number: 4, seats: 4, area: "Salão", status: "livre" },
      { id: "tbl_5", number: 5, seats: 4, area: "Salão", status: "livre" },
      { id: "tbl_6", number: 6, seats: 6, area: "Salão", status: "livre" },
      { id: "tbl_7", number: 7, seats: 2, area: "Varanda", status: "reservada" },
      { id: "tbl_8", number: 8, seats: 4, area: "Varanda", status: "livre" },
    ],
    orders: [mesaOrder, closedMesa, closedBalcao, onRoute, incoming],
  };
}

export function seedState(): AppState {
  const state = snapshot();
  const ingredients = state.ingredients.map((item) => ({ ...item }));
  for (const order of state.orders) {
    for (const item of order.items) {
      if (!item.fired) continue;
      const dish = state.dishes.find((entry) => entry.id === item.dishId);
      if (!dish) continue;
      for (const ingredient of ingredients) {
        const need = stockNeed(dish, item.qty, ingredient.id);
        if (need) ingredient.stock = Math.round((ingredient.stock - need) * 1000) / 1000;
      }
    }
  }
  return { ...state, ingredients };
}
