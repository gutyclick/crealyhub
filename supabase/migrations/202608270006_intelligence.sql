create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  snapshot_date date not null default current_date,
  views bigint,
  reach bigint,
  likes bigint,
  comments bigint,
  shares bigint,
  saves bigint,
  total_interactions bigint,
  engagement_rate numeric(10,6),
  save_rate numeric(10,6),
  share_rate numeric(10,6),
  raw_response jsonb not null default '{}',
  captured_at timestamptz not null default now(),
  unique(post_id,snapshot_date)
);

create table public.performance_patterns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  dimension text not null check(dimension in ('FORMAT','PILLAR')),
  dimension_value text not null,
  sample_size integer not null,
  average_engagement_rate numeric(10,6) not null default 0,
  baseline_engagement_rate numeric(10,6) not null default 0,
  lift_percentage numeric(10,2) not null default 0,
  confidence text not null check(confidence in ('LOW','MEDIUM','HIGH')),
  summary text not null,
  calculated_at timestamptz not null default now(),
  unique(brand_id,dimension,dimension_value)
);

create index analytics_brand_recent on public.analytics(brand_id,captured_at desc);
create index analytics_post_recent on public.analytics(post_id,captured_at desc);
create index performance_patterns_brand on public.performance_patterns(brand_id,lift_percentage desc);
alter table public.analytics enable row level security;
alter table public.performance_patterns enable row level security;
create policy "owner analytics" on public.analytics for select using(exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid()));
create policy "owner performance patterns" on public.performance_patterns for select using(exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid()));
