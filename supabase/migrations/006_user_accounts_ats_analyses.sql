-- Auth-linked accounts for interview-prep (avoids legacy public.profiles)
create table if not exists public.user_accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.user_accounts enable row level security;

create policy "Users can read own account"
  on public.user_accounts for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own account"
  on public.user_accounts for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke all on table public.user_accounts from anon, authenticated;
grant select, update on table public.user_accounts to authenticated;
grant all on table public.user_accounts to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_accounts (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', null)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.user_accounts.full_name),
        last_seen_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table if not exists public.ats_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  score integer not null check (score >= 0 and score <= 100),
  source text not null,
  apply_scope text not null check (apply_scope = any (array['local'::text, 'international'::text])),
  file_name text,
  candidate_name text,
  rating_label text,
  summary text,
  strengths jsonb not null default '[]'::jsonb,
  areas jsonb not null default '{}'::jsonb,
  top_fixes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ats_analyses_created_at_idx on public.ats_analyses (created_at desc);
create index if not exists ats_analyses_user_id_idx on public.ats_analyses (user_id);

alter table public.ats_analyses enable row level security;

create policy "Users can read own ats analyses"
  on public.ats_analyses for select
  to authenticated
  using (auth.uid() = user_id);

revoke all on table public.ats_analyses from anon, authenticated;
grant select on table public.ats_analyses to authenticated;
grant all on table public.ats_analyses to service_role;

alter table public.interview_sessions
  add column if not exists duration_minutes integer default 30,
  add column if not exists field_of_work text default '',
  add column if not exists location text default '',
  add column if not exists phone_number text default '',
  add column if not exists candidate_name text default '';
