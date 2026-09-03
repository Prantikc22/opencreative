create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  requester_name text not null check (char_length(requester_name) between 2 and 100),
  requester_email text not null check (char_length(requester_email) between 3 and 320),
  requester_phone text not null check (char_length(requester_phone) between 5 and 40),
  subject text not null default 'OpenCreative support request' check (char_length(subject) between 2 and 160),
  message text not null check (char_length(message) between 5 and 4000),
  status text not null default 'open' check (status in ('open','pending','closed')),
  source text not null default 'nori_widget' check (source in ('nori_widget','agent_widget','dashboard','api')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_workspace_status_idx
  on public.support_tickets(workspace_id,status,created_at desc);
create index if not exists support_tickets_agent_idx
  on public.support_tickets(agent_id,created_at desc) where agent_id is not null;

drop trigger if exists support_tickets_touch on public.support_tickets;
create trigger support_tickets_touch before update on public.support_tickets
  for each row execute function public.touch_updated_at();

alter table public.support_tickets enable row level security;

drop policy if exists support_tickets_workspace_read on public.support_tickets;
create policy support_tickets_workspace_read on public.support_tickets for select
  using(public.is_workspace_member(workspace_id));

drop policy if exists support_tickets_workspace_update on public.support_tickets;
create policy support_tickets_workspace_update on public.support_tickets for update
  using(public.is_workspace_member(workspace_id))
  with check(public.is_workspace_member(workspace_id));

comment on table public.support_tickets is
  'Tenant-separated support requests created by OpenCreative and customer agent widgets. Public inserts are performed only by the server service role after validation.';
