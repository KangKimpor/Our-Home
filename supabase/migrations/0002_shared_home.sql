-- Our Home: the couple's ONE shared living room save.
-- A single fixed row (id = 'our-home') holds every furniture slot choice, the pet,
-- both outfits and the lamp. api/home-state.ts reads/writes it through PostgREST,
-- using optimistic concurrency on `revision`.

create table if not exists public.shared_home (
  id text primary key check (id = 'our-home'),
  state jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.shared_home enable row level security;

-- The service role key bypasses RLS. These policies let the serverless function
-- fall back to the anon/publishable key while confining it to the one shared row.
drop policy if exists "shared_home_select" on public.shared_home;
create policy "shared_home_select" on public.shared_home
  for select to anon, authenticated
  using (id = 'our-home');

drop policy if exists "shared_home_insert" on public.shared_home;
create policy "shared_home_insert" on public.shared_home
  for insert to anon, authenticated
  with check (id = 'our-home');

drop policy if exists "shared_home_update" on public.shared_home;
create policy "shared_home_update" on public.shared_home
  for update to anon, authenticated
  using (id = 'our-home')
  with check (id = 'our-home');

grant select, insert, update on public.shared_home to anon, authenticated;
