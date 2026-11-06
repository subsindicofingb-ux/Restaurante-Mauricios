-- Esquema normalizado da casa: ficha, CMV, compras, estoque, salão e delivery.
-- O app de operação grava hoje em house_state. Estas tabelas ficam fechadas
-- (RLS sem política pública) até a autenticação entrar.

create table suppliers (
  id text primary key,
  name text not null,
  phone text not null default '',
  category text not null default ''
);

create table ingredients (
  id text primary key,
  name text not null,
  unit text not null check (unit in ('kg', 'g', 'L', 'ml', 'un')),
  category text not null,
  stock numeric not null default 0,
  min_stock numeric not null default 0,
  avg_cost numeric not null default 0,
  supplier_id text references suppliers (id)
);

create table dishes (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric not null,
  portions numeric not null default 1,
  prep_minutes integer not null default 15,
  station text not null check (station in ('grelha', 'fogao', 'frios', 'bar', 'doce')),
  channels text[] not null default '{salao,balcao,delivery}',
  active boolean not null default true
);

create table recipe_lines (
  id bigint generated always as identity primary key,
  dish_id text not null references dishes (id) on delete cascade,
  ingredient_id text not null references ingredients (id),
  qty numeric not null,
  waste_pct numeric not null default 0
);

create table purchases (
  id text primary key,
  supplier_id text not null references suppliers (id),
  invoice text not null default '',
  created_at timestamptz not null default now()
);

create table purchase_items (
  id bigint generated always as identity primary key,
  purchase_id text not null references purchases (id) on delete cascade,
  ingredient_id text not null references ingredients (id),
  qty numeric not null,
  unit_cost numeric not null
);

create table dining_tables (
  id text primary key,
  number integer not null unique,
  seats integer not null,
  area text not null,
  status text not null default 'livre' check (status in ('livre', 'ocupada', 'conta', 'reservada'))
);

create table orders (
  id text primary key,
  code text not null unique,
  channel text not null check (channel in ('mesa', 'balcao', 'delivery')),
  fulfillment text not null check (fulfillment in ('mesa', 'balcao', 'entrega', 'retirada')),
  status text not null,
  table_id text references dining_tables (id),
  customer_name text not null default '',
  phone text not null default '',
  address text not null default '',
  notes text not null default '',
  payment text not null default 'pendente',
  pay_method text,
  delivery_fee numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id text primary key,
  order_id text not null references orders (id) on delete cascade,
  dish_id text not null references dishes (id),
  qty numeric not null,
  notes text not null default '',
  fired boolean not null default false,
  status text not null default 'hold',
  unit_price numeric not null
);

create index orders_code_idx on orders (code);
create index orders_status_idx on orders (status);

alter table suppliers enable row level security;
alter table ingredients enable row level security;
alter table dishes enable row level security;
alter table recipe_lines enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;
alter table dining_tables enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
