-- Estado único da casa, compartilhado entre salão, cozinha, balcão e o celular do cliente.

create table if not exists public.house_state (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.house_state enable row level security;

drop policy if exists "public read house" on public.house_state;
create policy "public read house"
  on public.house_state
  for select
  to anon, authenticated
  using (true);

drop policy if exists "public insert house" on public.house_state;
create policy "public insert house"
  on public.house_state
  for insert
  to anon, authenticated
  with check (id = 1);

drop policy if exists "public update house" on public.house_state;
create policy "public update house"
  on public.house_state
  for update
  to anon, authenticated
  using (id = 1)
  with check (id = 1);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'house_state'
  ) then
    alter publication supabase_realtime add table public.house_state;
  end if;
end $$;
