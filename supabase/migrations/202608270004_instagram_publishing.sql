create table public.instagram_accounts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null unique references public.brands(id) on delete cascade,
  instagram_user_id text not null unique,
  username text not null,
  account_type text not null default 'UNKNOWN',
  access_token_ciphertext text not null,
  token_expires_at timestamptz,
  permissions text[] not null default '{}',
  status text not null default 'CONNECTED' check (status in ('CONNECTED','EXPIRED','DISCONNECTED','ERROR')),
  last_validated_at timestamptz,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.publishing_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  instagram_account_id uuid not null references public.instagram_accounts(id) on delete cascade,
  status public.job_status not null default 'QUEUED',
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 4,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  lease_expires_at timestamptz,
  container_id text,
  instagram_media_id text,
  last_error text,
  response_snapshot jsonb not null default '{}',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique(post_id)
);

alter table public.posts add column publishing_response jsonb not null default '{}';
create index publishing_jobs_ready on public.publishing_jobs(status,run_after) where status='QUEUED';
create index due_scheduled_posts on public.posts(scheduled_at) where status='SCHEDULED' and instagram_media_id is null;
create trigger instagram_accounts_updated_at before update on public.instagram_accounts for each row execute function public.set_updated_at();
alter table public.instagram_accounts enable row level security;
alter table public.publishing_jobs enable row level security;
create policy "owner instagram accounts" on public.instagram_accounts for all using (
  exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid())
) with check (exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid()));
create policy "owner publishing jobs" on public.publishing_jobs for select using (
  exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid())
);

create or replace function public.enqueue_due_publishing_jobs()
returns integer language plpgsql security definer set search_path=public as $$
declare inserted_count integer;
begin
  insert into public.publishing_jobs(brand_id,post_id,instagram_account_id,run_after)
  select p.brand_id,p.id,a.id,coalesce(p.scheduled_at,now())
  from public.posts p join public.instagram_accounts a on a.brand_id=p.brand_id and a.status='CONNECTED'
  where p.status='SCHEDULED' and p.approved_at is not null and p.scheduled_at<=now() and p.instagram_media_id is null
  on conflict(post_id) do nothing;
  get diagnostics inserted_count=row_count;
  return inserted_count;
end $$;

create or replace function public.claim_publishing_jobs(worker_name text,job_limit integer default 1)
returns setof public.publishing_jobs language plpgsql security definer set search_path=public as $$
begin
  return query with candidates as (
    select id from public.publishing_jobs where status='QUEUED' and run_after<=now()
      and (lease_expires_at is null or lease_expires_at<now()) order by run_after for update skip locked
      limit greatest(1,least(job_limit,5))
  ) update public.publishing_jobs j set status='RUNNING',locked_by=worker_name,locked_at=now(),
    lease_expires_at=now()+interval '5 minutes',attempt_count=attempt_count+1,started_at=coalesce(started_at,now())
  from candidates c where j.id=c.id returning j.*;
end $$;

revoke all on function public.enqueue_due_publishing_jobs() from public,anon,authenticated;
revoke all on function public.claim_publishing_jobs(text,integer) from public,anon,authenticated;
grant execute on function public.enqueue_due_publishing_jobs() to service_role;
grant execute on function public.claim_publishing_jobs(text,integer) to service_role;
