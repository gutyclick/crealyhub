create table public.carousels (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references public.posts(id) on delete cascade,
  topic text not null,
  objective text not null,
  hook text not null,
  cta text not null,
  visual_direction text not null,
  slide_count smallint not null check (slide_count between 2 and 10),
  created_at timestamptz not null default now()
);

create table public.carousel_slides (
  id uuid primary key default gen_random_uuid(),
  carousel_id uuid not null references public.carousels(id) on delete cascade,
  position smallint not null check (position between 1 and 10),
  role text not null,
  headline text not null,
  body text not null default '',
  visual_instruction text not null,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (carousel_id, position)
);

alter table public.posts
  add column cover_media_asset_id uuid references public.media_assets(id) on delete set null,
  add column content_fingerprint text,
  add column generation_completed_at timestamptz;

alter table public.generation_jobs
  add column started_at timestamptz,
  add column finished_at timestamptz,
  add column output_snapshot jsonb not null default '{}';

create index carousel_slides_ordered on public.carousel_slides(carousel_id, position);
create index posts_recent_memory on public.posts(brand_id, created_at desc);
create index generation_usage_daily on public.generation_usage(brand_id, operation, created_at desc);

alter table public.carousels enable row level security;
alter table public.carousel_slides enable row level security;

create policy "owner carousels" on public.carousels for all using (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
) with check (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);

create policy "owner carousel slides" on public.carousel_slides for all using (
  exists (
    select 1 from public.carousels c join public.posts p on p.id=c.post_id join public.brands b on b.id=p.brand_id
    where c.id=carousel_id and b.owner_user_id=auth.uid()
  )
) with check (
  exists (
    select 1 from public.carousels c join public.posts p on p.id=c.post_id join public.brands b on b.id=p.brand_id
    where c.id=carousel_id and b.owner_user_id=auth.uid()
  )
);

create or replace function public.claim_generation_jobs(worker_name text, job_limit integer default 1)
returns setof public.generation_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id from public.generation_jobs
    where status = 'QUEUED'
      and run_after <= now()
      and (lease_expires_at is null or lease_expires_at < now())
    order by priority desc, run_after asc
    for update skip locked
    limit greatest(1, least(job_limit, 10))
  )
  update public.generation_jobs j
  set status='RUNNING', locked_by=worker_name, locked_at=now(),
      lease_expires_at=now()+interval '5 minutes', started_at=coalesce(started_at, now()),
      attempt_count=attempt_count+1
  from candidates c where j.id=c.id
  returning j.*;
end;
$$;

revoke all on function public.claim_generation_jobs(text, integer) from public, anon, authenticated;
grant execute on function public.claim_generation_jobs(text, integer) to service_role;
