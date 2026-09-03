create table if not exists public.workspace_api_keys (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  token_hash text not null unique,
  token_prefix text not null,
  scopes text[] not null default array['creative']::text[],
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists workspace_api_keys_owner_idx
  on public.workspace_api_keys(workspace_id,user_id,created_at desc);

alter table public.workspace_api_keys enable row level security;

drop policy if exists workspace_api_keys_owner_read on public.workspace_api_keys;
create policy workspace_api_keys_owner_read on public.workspace_api_keys for select
  using(auth.uid() = user_id and public.is_workspace_member(workspace_id));

drop policy if exists workspace_api_keys_owner_create on public.workspace_api_keys;
create policy workspace_api_keys_owner_create on public.workspace_api_keys for insert
  with check(auth.uid() = user_id and public.is_workspace_member(workspace_id));

drop policy if exists workspace_api_keys_owner_revoke on public.workspace_api_keys;
create policy workspace_api_keys_owner_revoke on public.workspace_api_keys for update
  using(auth.uid() = user_id and public.is_workspace_member(workspace_id))
  with check(auth.uid() = user_id and public.is_workspace_member(workspace_id));
