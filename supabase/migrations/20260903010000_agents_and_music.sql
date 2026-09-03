create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  system_prompt text not null default 'Answer accurately and concisely from the approved knowledge only.',
  knowledge_text text not null default '',
  welcome_message text not null default 'Hello. How can I help?',
  voice text not null default 'Kore',
  language text not null default 'en',
  status text not null default 'active' check (status in ('draft','active','paused')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  channel text not null default 'studio' check (channel in ('studio','web','voice','api')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  session_id uuid not null references public.agent_sessions(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  input_kind text not null default 'text' check (input_kind in ('text','voice')),
  model_id text,
  usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agents_workspace_updated_idx on public.agents(workspace_id,updated_at desc);
create index if not exists agent_sessions_workspace_idx on public.agent_sessions(workspace_id,updated_at desc);
create index if not exists agent_messages_session_idx on public.agent_messages(session_id,created_at);

drop trigger if exists agents_touch on public.agents;
create trigger agents_touch before update on public.agents for each row execute function public.touch_updated_at();
drop trigger if exists agent_sessions_touch on public.agent_sessions;
create trigger agent_sessions_touch before update on public.agent_sessions for each row execute function public.touch_updated_at();

alter table public.agents enable row level security;
alter table public.agent_sessions enable row level security;
alter table public.agent_messages enable row level security;

drop policy if exists agents_workspace_access on public.agents;
create policy agents_workspace_access on public.agents for all
  using(public.is_workspace_member(workspace_id))
  with check(public.is_workspace_member(workspace_id));
drop policy if exists agent_sessions_workspace_access on public.agent_sessions;
create policy agent_sessions_workspace_access on public.agent_sessions for all
  using(public.is_workspace_member(workspace_id))
  with check(public.is_workspace_member(workspace_id));
drop policy if exists agent_messages_workspace_access on public.agent_messages;
create policy agent_messages_workspace_access on public.agent_messages for all
  using(public.is_workspace_member(workspace_id))
  with check(public.is_workspace_member(workspace_id));

insert into public.model_registry(id,provider,capability,display_name,quality_tier,capabilities,enabled,fallback_model)
values
  ('google/lyria-3-clip-preview','google','music','Music Clip','standard','{"duration_seconds":30}'::jsonb,true,null),
  ('google/lyria-3-pro-preview','google','music','Music Pro','premium','{"full_song":true}'::jsonb,true,'google/lyria-3-clip-preview')
on conflict (id) do update set
  display_name=excluded.display_name,
  quality_tier=excluded.quality_tier,
  capabilities=excluded.capabilities,
  enabled=excluded.enabled,
  fallback_model=excluded.fallback_model,
  updated_at=now();

insert into public.model_pricing(model_id,provider_cost,credit_formula)
values
  ('google/lyria-3-clip-preview','{"usd_per_clip":0.04}'::jsonb,'{"base":8,"duration_seconds":30}'::jsonb),
  ('google/lyria-3-pro-preview','{"usd_per_song":0.08}'::jsonb,'{"base":14,"full_song":true}'::jsonb)
on conflict (model_id) do update set
  provider_cost=excluded.provider_cost,
  credit_formula=excluded.credit_formula,
  updated_at=now();
