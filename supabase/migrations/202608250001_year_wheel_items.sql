create table if not exists public.year_wheel_items (
  id text primary key,
  task jsonb not null,
  status text not null default 'Att göra'
    check (status in ('Att göra', 'Pågår', 'Klart')),
  is_custom boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.year_wheel_items enable row level security;

revoke all on table public.year_wheel_items from anon;
grant select, insert, update, delete on table public.year_wheel_items to authenticated;

drop policy if exists "Authenticated board members can read year wheel" on public.year_wheel_items;
create policy "Authenticated board members can read year wheel"
  on public.year_wheel_items for select
  to authenticated
  using (true);

drop policy if exists "Authenticated board members can add year wheel items" on public.year_wheel_items;
create policy "Authenticated board members can add year wheel items"
  on public.year_wheel_items for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated board members can update year wheel items" on public.year_wheel_items;
create policy "Authenticated board members can update year wheel items"
  on public.year_wheel_items for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Authenticated board members can delete year wheel items" on public.year_wheel_items;
create policy "Authenticated board members can delete year wheel items"
  on public.year_wheel_items for delete
  to authenticated
  using (true);

create or replace function public.set_year_wheel_audit_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists set_year_wheel_audit_fields on public.year_wheel_items;
create trigger set_year_wheel_audit_fields
before insert or update on public.year_wheel_items
for each row execute function public.set_year_wheel_audit_fields();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'year_wheel_items'
  ) then
    alter publication supabase_realtime add table public.year_wheel_items;
  end if;
end
$$;
