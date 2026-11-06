-- Cadastro separado de clientes, funcionários e administradores.
-- O endereço de entrega fica indexado pelo CEP, pela rua, pelo bairro e pela cidade.

create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null default '',
  cep text not null default '',
  street text not null default '',
  number text not null default '',
  complement text not null default '',
  neighborhood text not null default '',
  city text not null default '',
  address text not null default '',
  password_hash text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.administrators (
  id text primary key,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists customers_cep_idx on public.customers (cep);
create index if not exists customers_street_idx on public.customers (street);
create index if not exists customers_neighborhood_idx on public.customers (neighborhood);
create index if not exists customers_city_idx on public.customers (city);
create index if not exists customers_phone_idx on public.customers (phone);

alter table public.customers add column if not exists password_hash text not null default '';
create index if not exists employees_name_idx on public.employees (name);
create index if not exists administrators_name_idx on public.administrators (name);

alter table public.customers enable row level security;
alter table public.employees enable row level security;
alter table public.administrators enable row level security;

revoke all on public.customers from anon, authenticated;
revoke all on public.employees from anon, authenticated;
revoke all on public.administrators from anon, authenticated;

grant select, insert, update on public.customers to anon, authenticated;
grant select, insert, update on public.employees to anon, authenticated;
grant select, insert, update on public.administrators to anon, authenticated;

drop policy if exists "public read customers" on public.customers;
create policy "public read customers" on public.customers for select to anon, authenticated using (true);
drop policy if exists "public insert customers" on public.customers;
create policy "public insert customers" on public.customers for insert to anon, authenticated with check (true);
drop policy if exists "public update customers" on public.customers;
create policy "public update customers" on public.customers for update to anon, authenticated using (true) with check (true);

drop policy if exists "public read employees" on public.employees;
create policy "public read employees" on public.employees for select to anon, authenticated using (true);
drop policy if exists "public insert employees" on public.employees;
create policy "public insert employees" on public.employees for insert to anon, authenticated with check (true);
drop policy if exists "public update employees" on public.employees;
create policy "public update employees" on public.employees for update to anon, authenticated using (true) with check (true);

drop policy if exists "public read administrators" on public.administrators;
create policy "public read administrators" on public.administrators for select to anon, authenticated using (true);
drop policy if exists "public insert administrators" on public.administrators;
create policy "public insert administrators" on public.administrators for insert to anon, authenticated with check (true);
drop policy if exists "public update administrators" on public.administrators;
create policy "public update administrators" on public.administrators for update to anon, authenticated using (true) with check (true);
