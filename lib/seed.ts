import { houseMenu } from "./menu";
import { houseIngredients, houseSuppliers } from "./pantry";
import type { AppState } from "./types";

function copyPantry() {
  return {
    suppliers: houseSuppliers.map((item) => ({ ...item })),
    ingredients: houseIngredients.map((item) => ({ ...item })),
  };
}

export function seedState(): AppState {
  const pantry = copyPantry();
  return {
    suppliers: pantry.suppliers,
    ingredients: pantry.ingredients,
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
    expenses: [],
    withdrawals: [],
    cashCloses: [],
  };
}

function withBooks(state: AppState): AppState {
  return {
    ...state,
    customers: Array.isArray(state.customers) ? state.customers : [],
    expenses: Array.isArray(state.expenses) ? state.expenses : [],
    withdrawals: Array.isArray(state.withdrawals) ? state.withdrawals : [],
    cashCloses: Array.isArray(state.cashCloses) ? state.cashCloses : [],
  };
}

export function adoptHouse(state: AppState): AppState {
  const demo = state.dishes.some((dish) => dish.id === "dish_picanha" || dish.name === "Picanha na brasa");
  const base = withBooks(demo ? seedState() : state);
  if (base.ingredients.length > 0) return base;
  const pantry = copyPantry();
  return {
    ...base,
    suppliers: base.suppliers.length ? base.suppliers : pantry.suppliers,
    ingredients: pantry.ingredients,
  };
}
