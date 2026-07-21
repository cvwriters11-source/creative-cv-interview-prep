-- Add interview length (15 / 30 / 60 minutes)
alter table public.interview_sessions
  add column if not exists duration_minutes int not null default 30
  check (duration_minutes in (15, 30, 60));
