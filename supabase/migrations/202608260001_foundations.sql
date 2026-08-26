create extension if not exists pgcrypto;

create type public.content_format as enum ('POST', 'STORY', 'CAROUSEL', 'REEL');
create type public.content_status as enum (
  'IDEA', 'GENERATING', 'PENDING_APPROVAL', 'NEEDS_CHANGES', 'APPROVED',
  'SCHEDULED', 'PUBLISHING', 'PUBLISHED', 'REJECTED', 'FAILED',
  'READY_FOR_MANUAL_PUBLISH'
);
create type public.job_status as enum ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
create type public.asset_kind as enum ('LOGO', 'VISUAL_REFERENCE', 'PRODUCT', 'GENERATED', 'FINAL', 'OTHER');

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  product_service text not null default '',
  website text,
  audience text not null default '',
  objectives text not null default '',
  tone text not null default '',
  personality text not null default '',
  default_cta text not null default '',
  language text not null default 'es',
  timezone text not null default 'America/Panama',
  allowed_phrases text[] not null default '{}',
  forbidden_phrases text[] not null default '{}',
  hashtag_rules text not null default '',
  editorial_rules text not null default '',
  review_mode boolean not null default true,
  autopilot_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, name)
);

create table public.brand_colors (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  role text not null default 'accent',
  sort_order smallint not null default 0
);

create table public.content_strategies (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null default 'Default strategy',
  is_active boolean not null default true,
  daily_frequency_min smallint not null default 2 check (daily_frequency_min between 0 and 20),
  daily_frequency_max smallint not null default 3 check (daily_frequency_max between 0 and 20),
  buffer_days smallint not null default 5 check (buffer_days between 1 and 30),
  strategy_notes text not null default '',
  valid_from date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (daily_frequency_max >= daily_frequency_min)
);

create unique index one_active_strategy_per_brand
  on public.content_strategies (brand_id) where is_active;

create table public.content_pillars (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  description text not null default '',
  target_percentage numeric(5,2) not null default 0 check (target_percentage between 0 and 100),
  active boolean not null default true,
  sort_order smallint not null default 0,
  unique (brand_id, name)
);

create table public.format_targets (
  strategy_id uuid not null references public.content_strategies(id) on delete cascade,
  format public.content_format not null,
  target_percentage numeric(5,2) not null check (target_percentage between 0 and 100),
  primary key (strategy_id, format)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  kind public.asset_kind not null,
  storage_provider text not null default 'supabase',
  bucket text not null,
  object_key text not null,
  mime_type text not null,
  width integer,
  height integer,
  bytes bigint,
  checksum_sha256 text,
  source_asset_id uuid references public.media_assets(id) on delete set null,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  unique (bucket, object_key)
);

create table public.brand_assets (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  kind public.asset_kind not null,
  label text not null default '',
  notes text not null default '',
  sort_order smallint not null default 0
);

create table public.content_ideas (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  topic text not null,
  objective text not null,
  hook text not null default '',
  concept text not null,
  recommended_format public.content_format not null,
  visual_direction text not null default '',
  strategy_reason text not null default '',
  novelty_score numeric(4,3),
  planned_for timestamptz,
  status public.content_status not null default 'IDEA',
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  idea_id uuid references public.content_ideas(id) on delete set null,
  pillar_id uuid references public.content_pillars(id) on delete set null,
  format public.content_format not null,
  status public.content_status not null default 'IDEA',
  scheduled_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  instagram_media_id text,
  failure_code text,
  failure_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_versions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  hook text not null default '',
  caption text not null default '',
  cta text not null default '',
  alt_text text not null default '',
  hashtags text[] not null default '{}',
  visual_direction text not null default '',
  source_version_id uuid references public.post_versions(id) on delete set null,
  change_reason text,
  created_by_kind text not null check (created_by_kind in ('AI', 'USER')),
  created_at timestamptz not null default now(),
  unique (post_id, version_number)
);

alter table public.posts add column current_version_id uuid references public.post_versions(id) on delete set null;

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  scheduled_at timestamptz not null,
  timezone text not null,
  revision integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index one_active_schedule_per_post on public.schedules(post_id) where active;

create table public.generation_jobs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  job_type text not null,
  status public.job_status not null default 'QUEUED',
  priority smallint not null default 0,
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 3,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  lease_expires_at timestamptz,
  idempotency_key text not null unique,
  input_snapshot jsonb not null default '{}',
  last_error text,
  created_at timestamptz not null default now()
);

create table public.generation_usage (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  provider text not null,
  model text not null,
  operation text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  images integer not null default 0,
  estimated_cost_usd numeric(12,6) not null default 0,
  created_at timestamptz not null default now()
);

create table public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete cascade,
  run_type text not null,
  status public.job_status not null,
  summary text not null default '',
  decision jsonb not null default '{}',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error_code text
);

create table public.agent_run_events (
  id bigint generated always as identity primary key,
  agent_run_id uuid not null references public.agent_runs(id) on delete cascade,
  level text not null check (level in ('debug', 'info', 'warn', 'error')),
  message text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index posts_by_status_schedule on public.posts(brand_id, status, scheduled_at);
create index ideas_by_planned_date on public.content_ideas(brand_id, planned_for);
create index generation_jobs_ready on public.generation_jobs(status, priority desc, run_after) where status = 'QUEUED';
create index usage_by_month on public.generation_usage(brand_id, created_at desc);
create index agent_runs_recent on public.agent_runs(brand_id, started_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger brands_updated_at before update on public.brands
for each row execute function public.set_updated_at();
create trigger strategies_updated_at before update on public.content_strategies
for each row execute function public.set_updated_at();
create trigger posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();
create trigger schedules_updated_at before update on public.schedules
for each row execute function public.set_updated_at();

alter table public.brands enable row level security;
alter table public.brand_colors enable row level security;
alter table public.content_strategies enable row level security;
alter table public.content_pillars enable row level security;
alter table public.format_targets enable row level security;
alter table public.media_assets enable row level security;
alter table public.brand_assets enable row level security;
alter table public.content_ideas enable row level security;
alter table public.posts enable row level security;
alter table public.post_versions enable row level security;
alter table public.schedules enable row level security;
alter table public.generation_jobs enable row level security;
alter table public.generation_usage enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_run_events enable row level security;

create policy "owners manage brands" on public.brands for all
using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'brand_colors', 'content_strategies', 'content_pillars', 'media_assets',
    'brand_assets', 'content_ideas', 'posts', 'generation_jobs',
    'generation_usage', 'agent_runs'
  ] loop
    execute format(
      'create policy "owner access" on public.%I for all using (exists (select 1 from public.brands b where b.id = brand_id and b.owner_user_id = auth.uid())) with check (exists (select 1 from public.brands b where b.id = brand_id and b.owner_user_id = auth.uid()))',
      table_name
    );
  end loop;
end $$;

create policy "owner format targets" on public.format_targets for all using (
  exists (select 1 from public.content_strategies s join public.brands b on b.id=s.brand_id where s.id=strategy_id and b.owner_user_id=auth.uid())
) with check (
  exists (select 1 from public.content_strategies s join public.brands b on b.id=s.brand_id where s.id=strategy_id and b.owner_user_id=auth.uid())
);
create policy "owner post versions" on public.post_versions for all using (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
) with check (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);
create policy "owner schedules" on public.schedules for all using (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
) with check (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);
create policy "owner run events" on public.agent_run_events for select using (
  exists (select 1 from public.agent_runs r join public.brands b on b.id=r.brand_id where r.id=agent_run_id and b.owner_user_id=auth.uid())
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content-media', 'content-media', false, 52428800, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "owners read media" on storage.objects for select using (
  bucket_id = 'content-media' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "owners upload media" on storage.objects for insert with check (
  bucket_id = 'content-media' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "owners update media" on storage.objects for update using (
  bucket_id = 'content-media' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "owners delete media" on storage.objects for delete using (
  bucket_id = 'content-media' and (storage.foldername(name))[1] = auth.uid()::text
);
