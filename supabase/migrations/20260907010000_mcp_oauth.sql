-- OAuth 2.1 storage for remote MCP clients. These tables are server-only;
-- route handlers use the Supabase service-role client and no browser policy is added.
create table if not exists public.mcp_oauth_clients (
  client_id text primary key,
  client_name text,
  redirect_uris text[] not null,
  token_endpoint_auth_method text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mcp_oauth_authorization_codes (
  code_hash text primary key,
  client_id text not null references public.mcp_oauth_clients(client_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  scope text not null default 'creative',
  resource text not null,
  code_challenge text not null,
  code_challenge_method text not null default 'S256',
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_codes_expiry_idx
  on public.mcp_oauth_authorization_codes(expires_at);

create table if not exists public.mcp_oauth_access_tokens (
  token_hash text primary key,
  client_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  scope text not null default 'creative',
  resource text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mcp_oauth_tokens_user_idx
  on public.mcp_oauth_access_tokens(user_id, expires_at);

alter table public.mcp_oauth_clients enable row level security;
alter table public.mcp_oauth_authorization_codes enable row level security;
alter table public.mcp_oauth_access_tokens enable row level security;

-- ChatGPT's public connector client uses a stable CIMD client id. Keeping the
-- record here satisfies the authorization-code foreign key without exposing
-- any secret.
insert into public.mcp_oauth_clients (client_id, client_name, redirect_uris)
values ('https://chatgpt.com/oauth/client.json', 'ChatGPT', array['https://chatgpt.com/connector_platform_oauth_redirect']::text[])
on conflict (client_id) do update set redirect_uris = excluded.redirect_uris, updated_at = now();
