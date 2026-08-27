create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  source_version_id uuid not null references public.post_versions(id) on delete restrict,
  result_version_id uuid references public.post_versions(id) on delete set null,
  feedback text not null check (char_length(trim(feedback)) between 3 and 2000),
  status text not null default 'OPEN' check (status in ('OPEN', 'RESOLVED', 'CANCELLED')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.post_status_events (
  id bigint generated always as identity primary key,
  post_id uuid not null references public.posts(id) on delete cascade,
  from_status public.content_status,
  to_status public.content_status not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index revision_requests_by_post on public.revision_requests(post_id, created_at desc);
create index post_status_events_by_post on public.post_status_events(post_id, created_at desc);

alter table public.revision_requests enable row level security;
alter table public.post_status_events enable row level security;

create policy "owner revision requests" on public.revision_requests for all using (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
) with check (
  created_by=auth.uid() and exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);

create policy "owner status events" on public.post_status_events for select using (
  exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);
create policy "owner creates status events" on public.post_status_events for insert with check (
  actor_user_id=auth.uid() and exists (select 1 from public.posts p join public.brands b on b.id=p.brand_id where p.id=post_id and b.owner_user_id=auth.uid())
);

create or replace function public.apply_editorial_transition(
  target_post_id uuid,
  next_status public.content_status,
  event_note text default ''
) returns public.posts
language plpgsql security invoker set search_path=public as $$
declare current_post public.posts; previous_status public.content_status;
begin
  select * into current_post from public.posts where id=target_post_id for update;
  if current_post.id is null then raise exception 'Post not found'; end if;
  previous_status := current_post.status;
  if not (
    (current_post.status in ('PENDING_APPROVAL','NEEDS_CHANGES') and next_status in ('APPROVED','SCHEDULED','REJECTED','NEEDS_CHANGES')) or
    (current_post.status in ('APPROVED','SCHEDULED') and next_status in ('APPROVED','SCHEDULED'))
  ) then raise exception 'Invalid editorial transition: % -> %', current_post.status, next_status; end if;
  update public.posts set status=next_status,
    approved_at=case when next_status in ('APPROVED','SCHEDULED') then coalesce(approved_at,now()) else approved_at end,
    approved_by=case when next_status in ('APPROVED','SCHEDULED') then coalesce(approved_by,auth.uid()) else approved_by end
  where id=target_post_id returning * into current_post;
  insert into public.post_status_events(post_id,from_status,to_status,actor_user_id,note)
  values(target_post_id,previous_status,next_status,auth.uid(),event_note);
  return current_post;
end; $$;

grant execute on function public.apply_editorial_transition(uuid,public.content_status,text) to authenticated;
