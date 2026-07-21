-- Signup without sending confirmation emails (avoids Auth email rate limits).

create or replace function public.create_account(
  p_email text,
  p_password text,
  p_full_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid;
  normalized_email text;
  recent_count int;
begin
  normalized_email := lower(trim(p_email));

  if normalized_email is null
     or normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.';
  end if;

  if p_password is null or char_length(p_password) < 6 then
    raise exception 'Password must be at least 6 characters.';
  end if;

  select count(*)::int into recent_count
  from auth.users
  where created_at > now() - interval '1 hour';

  if recent_count >= 40 then
    raise exception 'Too many new accounts right now. Please try again in a few minutes.';
  end if;

  if exists (
    select 1 from auth.users where lower(email) = normalized_email
  ) then
    raise exception 'An account with this email already exists. Please sign in.';
  end if;

  uid := gen_random_uuid();

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) values (
    '00000000-0000-0000-0000-000000000000',
    uid,
    'authenticated',
    'authenticated',
    normalized_email,
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    case
      when nullif(trim(coalesce(p_full_name, '')), '') is null then '{}'::jsonb
      else jsonb_build_object('full_name', trim(p_full_name))
    end,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    uid,
    jsonb_build_object(
      'sub', uid::text,
      'email', normalized_email,
      'email_verified', true
    ),
    'email',
    uid::text,
    now(),
    now(),
    now()
  );

  return jsonb_build_object(
    'ok', true,
    'id', uid,
    'email', normalized_email
  );
end;
$$;

revoke all on function public.create_account(text, text, text) from public;
grant execute on function public.create_account(text, text, text) to anon, authenticated;

-- Confirm any existing unconfirmed emails so they can sign in now
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;
