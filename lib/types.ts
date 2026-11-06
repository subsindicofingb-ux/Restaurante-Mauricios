export type Unit = "kg" | "g" | "L" | "ml" | "un";

export type Station = "grelha" | "fogao" | "frios" | "bar" | "doce";

export type Channel = "salao" | "balcao" | "delivery";

export type TableStatus = "livre" | "ocupada" | "conta" | "reservada";

export type OrderChannel = "mesa" | "balcao" | "delivery";

export type Fulfillment = "mesa" | "balcao" | "entrega" | "retirada";

export type OrderStatus =
  | "aberto"
  | "recebido"
  | "preparo"
  | "pronto"
  | "saiu"
  | "entregue"
  | "fechado"
  | "cancelado";

export type ItemStatus = "hold" | "preparo" | "pronto" | "entregue";

export type PayMethod = "pix" | "cartao" | "dinheiro";

export type PaymentState = "pendente" | "pago";

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  category: string;
  stock: number;
  minStock: number;
  avgCost: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
}

export interface RecipeLine {
  ingredientId: string;
  qty: number;
  wastePct: number;
}

export interface Dish {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  portions: number;
  prepMinutes: number;
  station: Station;
  channels: Channel[];
  active: boolean;
  lines: RecipeLine[];
}

export interface PurchaseItem {
  ingredientId: string;
  qty: number;
  unitCost: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  createdAt: string;
  invoice: string;
  items: PurchaseItem[];
}

export interface DiningTable {
  id: string;
  number: number;
  seats: number;
  area: string;
  status: TableStatus;
}

export interface OrderItem {
  id: string;
  dishId: string;
  qty: number;
  notes: string;
  fired: boolean;
  status: ItemStatus;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  channel: OrderChannel;
  fulfillment: Fulfillment;
  status: OrderStatus;
  tableId?: string;
  customerName: string;
  phone: string;
  address: string;
  notes: string;
  items: OrderItem[];
  payment: PaymentState;
  payMethod: PayMethod | null;
  deliveryFee: number;
  stockAppliedIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface CashExpense {
  id: string;
  createdAt: string;
  description: string;
  category: string;
  amount: number;
}

export interface CashWithdrawal {
  id: string;
  createdAt: string;
  by: string;
  reason: string;
  amount: number;
}

export interface CashClose {
  id: string;
  createdAt: string;
  by: string;
  revenue: number;
  cashSales: number;
  expenses: number;
  withdrawals: number;
  expectedCash: number;
  countedCash: number;
  note: string;
}

export interface AppState {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  dishes: Dish[];
  purchases: Purchase[];
  tables: DiningTable[];
  orders: Order[];
  customers: Customer[];
  expenses: CashExpense[];
  withdrawals: CashWithdrawal[];
  cashCloses: CashClose[];
}
