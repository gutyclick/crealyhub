create table public.automation_locks (
  lock_key text primary key,
  owner text not null,
  locked_until timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.automation_locks enable row level security;

create or replace function public.acquire_automation_lock(
  target_key text,
  target_owner text,
  ttl_seconds integer default 300
) returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.automation_locks(lock_key, owner, locked_until)
  values (target_key, target_owner, now() + make_interval(secs => ttl_seconds))
  on conflict (lock_key) do update
    set owner = excluded.owner,
        locked_until = excluded.locked_until,
        updated_at = now()
    where automation_locks.locked_until < now();
  return exists (
    select 1 from public.automation_locks
    where lock_key = target_key and owner = target_owner and locked_until > now()
  );
end;
$$;

create or replace function public.release_automation_lock(target_key text, target_owner text)
returns void language sql security definer set search_path = public
as $$
  delete from public.automation_locks where lock_key = target_key and owner = target_owner;
$$;

alter table public.agent_runs add column idempotency_key text;
create unique index agent_runs_idempotency on public.agent_runs(idempotency_key) where idempotency_key is not null;

revoke all on public.automation_locks from anon, authenticated;
revoke all on function public.acquire_automation_lock(text,text,integer) from public, anon, authenticated;
revoke all on function public.release_automation_lock(text,text) from public, anon, authenticated;
grant execute on function public.acquire_automation_lock(text,text,integer) to service_role;
grant execute on function public.release_automation_lock(text,text) to service_role;
