-- Candidate application fields (industry-standard intake)
alter table public.interview_sessions
  add column if not exists field_of_work text not null default 'General';

alter table public.interview_sessions
  add column if not exists location text not null default 'Not specified';

alter table public.interview_sessions
  add column if not exists phone_number text not null default '';
