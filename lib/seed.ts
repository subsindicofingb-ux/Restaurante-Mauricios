import { houseMenu } from "./menu";
import type { AppState } from "./types";

export function seedState(): AppState {
  return {
    suppliers: [],
    ingredients: [],
    dishes: houseMenu.map((dish) => ({ ...dish, lines: dish.lines.map((line) => ({ ...line })) })),
    purchases: [],
    tables: [
      { id: "tbl_1", number: 1, seats: 2, area: "Salão", status: "livre" },
      { id: "tbl_2", number: 2, seats: 2, area: "Salão", status: "livre" },
      { id: "tbl_3", number: 3, seats: 4, area: "Salão", status: "livre" },
      { id: "tbl_4", number: 4, seats: 4, area: "Salão", status: "livre" },
      { id: "tbl_5", number: 5, seats: 4, area: "Salão", status: "livre" },
      { id: "tbl_6", number: 6, seats: 6, area: "Salão", status: "livre" },
      { id: "tbl_7", number: 7, seats: 2, area: "Varanda", status: "livre" },
      { id: "tbl_8", number: 8, seats: 4, area: "Varanda", status: "livre" },
    ],
    orders: [],
    customers: [],
  };
}

export function adoptHouse(state: AppState): AppState {
  const customers = Array.isArray(state.customers) ? state.customers : [];
  const demo = state.dishes.some((dish) => dish.id === "dish_picanha" || dish.name === "Picanha na brasa");
  if (demo) return seedState();
  return { ...state, customers };
}
