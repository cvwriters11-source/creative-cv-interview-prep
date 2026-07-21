-- Profiles for registered users (tracks who signed up)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Site visit / activity log for tracking traffic
create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  event text not null check (event in ('register', 'login', 'visit')),
  path text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists site_visits_created_at_idx on public.site_visits (created_at desc);
create index if not exists site_visits_user_id_idx on public.site_visits (user_id);

alter table public.site_visits enable row level security;

create policy "Users can read own visits"
  on public.site_visits for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke all on table public.profiles from anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

revoke all on table public.site_visits from anon, authenticated;
grant select on table public.site_visits to authenticated;
grant all on table public.site_visits to service_role;
