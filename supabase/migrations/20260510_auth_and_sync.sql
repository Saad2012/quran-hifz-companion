create extension if not exists "pgcrypto";

create table if not exists public.user_hifz_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null,
  payload_version integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_synced_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_user_hifz_snapshots()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  new.last_synced_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists user_hifz_snapshots_touch on public.user_hifz_snapshots;

create trigger user_hifz_snapshots_touch
before update on public.user_hifz_snapshots
for each row
execute function public.touch_user_hifz_snapshots();

alter table public.user_hifz_snapshots enable row level security;

drop policy if exists "Users can view their own hifz snapshots" on public.user_hifz_snapshots;
create policy "Users can view their own hifz snapshots"
on public.user_hifz_snapshots
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own hifz snapshots" on public.user_hifz_snapshots;
create policy "Users can insert their own hifz snapshots"
on public.user_hifz_snapshots
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own hifz snapshots" on public.user_hifz_snapshots;
create policy "Users can update their own hifz snapshots"
on public.user_hifz_snapshots
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own hifz snapshots" on public.user_hifz_snapshots;
create policy "Users can delete their own hifz snapshots"
on public.user_hifz_snapshots
for delete
to authenticated
using ((select auth.uid()) = user_id);
