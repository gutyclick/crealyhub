create table public.brand_fonts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  name text not null,
  role text not null check(role in ('DISPLAY','BODY')),
  created_at timestamptz not null default now(),
  unique(brand_id,role)
);
alter table public.brand_fonts enable row level security;
create policy "owner brand fonts" on public.brand_fonts for all using(exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid())) with check(exists(select 1 from public.brands b where b.id=brand_id and b.owner_user_id=auth.uid()));
