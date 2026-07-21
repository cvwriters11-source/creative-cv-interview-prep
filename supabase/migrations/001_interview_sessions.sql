-- Career Win interview sessions
create extension if not exists "pgcrypto";

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  scheduled_at timestamptz not null,
  voice_gender text not null check (voice_gender in ('male', 'female')),
  role_title text not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  transcript jsonb,
  score int check (score is null or (score >= 0 and score <= 100)),
  feedback jsonb,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists interview_sessions_user_id_idx
  on public.interview_sessions (user_id);

create index if not exists interview_sessions_scheduled_at_idx
  on public.interview_sessions (scheduled_at);

alter table public.interview_sessions enable row level security;

-- Deny direct Data API access; Next.js uses service role with Clerk user_id checks.
revoke all on table public.interview_sessions from anon, authenticated;
grant all on table public.interview_sessions to service_role;
