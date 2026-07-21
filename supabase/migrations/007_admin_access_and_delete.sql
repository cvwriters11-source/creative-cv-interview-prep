-- Admin helpers: read all site data + remove users without service_role in the app

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'samuel@creative-cv.co.za';
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- Interview sessions: allow authenticated users (was service_role only)
grant select, insert, update, delete on table public.interview_sessions to authenticated;

drop policy if exists "Users manage own interview sessions" on public.interview_sessions;
create policy "Users manage own interview sessions"
  on public.interview_sessions
  for all
  to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

drop policy if exists "Admins manage all interview sessions" on public.interview_sessions;
create policy "Admins manage all interview sessions"
  on public.interview_sessions
  for all
  to authenticated
  using (public.is_app_admin())
  with check (public.is_app_admin());

-- user_accounts
drop policy if exists "Admins read all accounts" on public.user_accounts;
create policy "Admins read all accounts"
  on public.user_accounts
  for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "Admins delete accounts" on public.user_accounts;
create policy "Admins delete accounts"
  on public.user_accounts
  for delete
  to authenticated
  using (public.is_app_admin());

-- site_visits
grant select, insert on table public.site_visits to authenticated;

drop policy if exists "Admins read all visits" on public.site_visits;
create policy "Admins read all visits"
  on public.site_visits
  for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "Users insert own visits" on public.site_visits;
create policy "Users insert own visits"
  on public.site_visits
  for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

-- ats_analyses
grant select, insert on table public.ats_analyses to authenticated;

drop policy if exists "Admins read all ats" on public.ats_analyses;
create policy "Admins read all ats"
  on public.ats_analyses
  for select
  to authenticated
  using (public.is_app_admin());

drop policy if exists "Users insert own ats" on public.ats_analyses;
create policy "Users insert own ats"
  on public.ats_analyses
  for insert
  to authenticated
  with check (user_id is null or user_id = auth.uid());

-- Remove a user (auth + related app rows). interview_sessions.user_id is text (no FK).
create or replace function public.admin_delete_user(target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_email text;
begin
  if not public.is_app_admin() then
    raise exception 'Admin only';
  end if;

  if target_id = auth.uid() then
    raise exception 'You cannot delete your own admin account';
  end if;

  select email into target_email from auth.users where id = target_id;
  if target_email is null then
    raise exception 'User not found';
  end if;

  delete from public.interview_sessions where user_id = target_id::text;
  delete from public.ats_analyses where user_id = target_id;
  delete from public.site_visits where user_id = target_id;
  delete from public.user_accounts where id = target_id;
  delete from auth.users where id = target_id;

  return jsonb_build_object('ok', true, 'id', target_id, 'email', target_email);
end;
$$;

revoke all on function public.admin_delete_user(uuid) from public;
grant execute on function public.admin_delete_user(uuid) to authenticated;
