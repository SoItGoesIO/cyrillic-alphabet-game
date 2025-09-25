-- Minimal schema for quick setup (fixed version)
create extension if not exists "uuid-ossp";

-- Drop types if they exist and recreate them
drop type if exists item_type cascade;
drop type if exists item_status cascade;

create type item_type as enum ('task','habit','quest');
create type item_status as enum ('created','in_progress','completed');

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text default 'en',
  timezone text default 'Europe/Amsterdam',
  total_xp int default 0,
  level int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type item_type not null default 'task',
  title text not null,
  description text,
  status item_status not null default 'created',
  due_at timestamptz,
  completed_at timestamptz,
  xp_reward int default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  score int default 0
);

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.quiz_sessions enable row level security;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles: select own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "items: user owns" on public.items;
drop policy if exists "quiz_sessions: user owns" on public.quiz_sessions;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "profiles: insert own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "items: user owns"
  on public.items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "quiz_sessions: user owns"
  on public.quiz_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
