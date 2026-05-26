
-- Lock down handle_updated_at (add search_path)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Revoke execute on internal trigger functions from API roles
revoke execute on function public.handle_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
