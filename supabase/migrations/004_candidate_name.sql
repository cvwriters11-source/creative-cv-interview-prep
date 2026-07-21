-- Candidate display name for scored results
alter table public.interview_sessions
  add column if not exists candidate_name text not null default 'Candidate';
