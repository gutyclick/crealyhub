create table public.creative_feedback (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  post_id uuid references public.posts(id) on delete set null,
  outcome text not null check (outcome in ('APPROVED', 'REJECTED')),
  reason text not null default '',
  creative_snapshot jsonb not null default '{}',
  actor_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index creative_feedback_brand_recent
  on public.creative_feedback(brand_id, created_at desc);

alter table public.creative_feedback enable row level security;

create policy "owner creative feedback" on public.creative_feedback for all
using (
  exists (
    select 1 from public.brands b
    where b.id = brand_id and b.owner_user_id = auth.uid()
  )
)
with check (
  actor_user_id = auth.uid() and exists (
    select 1 from public.brands b
    where b.id = brand_id and b.owner_user_id = auth.uid()
  )
);
