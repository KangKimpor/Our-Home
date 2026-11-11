-- Our Home cloud save schema (Supabase / Postgres)
-- Run this in the SQL editor after enabling Auth0 under Supabase Third-Party Auth.
-- Only the public Supabase URL and publishable key belong in the client.

create table if not exists public.saves (
  user_id text primary key,
  data jsonb not null,
  version int not null default 1,
  revision int not null default 1,
  device_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.save_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists save_snapshots_user_created_idx
  on public.save_snapshots (user_id, created_at desc);

alter table public.saves enable row level security;
alter table public.save_snapshots enable row level security;

drop policy if exists "saves_owner_select" on public.saves;
create policy "saves_owner_select" on public.saves
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "saves_owner_insert" on public.saves;
create policy "saves_owner_insert" on public.saves
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "saves_owner_update" on public.saves;
create policy "saves_owner_update" on public.saves
  for update using ((auth.jwt() ->> 'sub') = user_id)
  with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "saves_owner_delete" on public.saves;
create policy "saves_owner_delete" on public.saves
  for delete using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "snapshots_owner_select" on public.save_snapshots;
create policy "snapshots_owner_select" on public.save_snapshots
  for select using ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "snapshots_owner_insert" on public.save_snapshots;
create policy "snapshots_owner_insert" on public.save_snapshots
  for insert with check ((auth.jwt() ->> 'sub') = user_id);

drop policy if exists "snapshots_owner_delete" on public.save_snapshots;
create policy "snapshots_owner_delete" on public.save_snapshots
  for delete using ((auth.jwt() ->> 'sub') = user_id);
