-- Source: supabase/migrations/20260903000000_music_capability.sql

alter type public.generation_capability add value if not exists 'music';

-- -----------------------------------------------------------------------------

-- Source: supabase/migrations/20260903010000_agents_and_music.sql

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

-- -----------------------------------------------------------------------------

-- Source: supabase/migrations/20260903020000_affiliates.sql

create table if not exists public.affiliate_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  code text not null unique check (code ~ '^[a-z0-9-]{4,48}$'),
  status text not null default 'active' check (status in ('pending','active','paused')),
  payout_email text not null,
  click_count integer not null default 0 check (click_count >= 0),
  conversion_count integer not null default 0 check (conversion_count >= 0),
  pending_earnings numeric(12,2) not null default 0 check (pending_earnings >= 0),
  approved_earnings numeric(12,2) not null default 0 check (approved_earnings >= 0),
  paid_earnings numeric(12,2) not null default 0 check (paid_earnings >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists affiliate_accounts_workspace_idx on public.affiliate_accounts(workspace_id);
drop trigger if exists affiliate_accounts_touch on public.affiliate_accounts;
create trigger affiliate_accounts_touch before update on public.affiliate_accounts
  for each row execute function public.touch_updated_at();

alter table public.affiliate_accounts enable row level security;

drop policy if exists affiliate_owner_read on public.affiliate_accounts;
create policy affiliate_owner_read on public.affiliate_accounts for select
  using(auth.uid() = user_id and public.is_workspace_member(workspace_id));
drop policy if exists affiliate_owner_create on public.affiliate_accounts;
create policy affiliate_owner_create on public.affiliate_accounts for insert
  with check(auth.uid() = user_id and public.is_workspace_member(workspace_id));
drop policy if exists affiliate_owner_update on public.affiliate_accounts;
create policy affiliate_owner_update on public.affiliate_accounts for update
  using(auth.uid() = user_id and public.is_workspace_member(workspace_id))
  with check(auth.uid() = user_id and public.is_workspace_member(workspace_id));

create or replace function public.record_affiliate_click(referral_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if referral_code !~ '^[a-z0-9-]{4,48}$' then return false; end if;
  update public.affiliate_accounts
     set click_count = click_count + 1
   where code = referral_code and status = 'active';
  return found;
end;
$$;

revoke all on function public.record_affiliate_click(text) from public;
grant execute on function public.record_affiliate_click(text) to anon, authenticated;

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliate_accounts(id) on delete cascade,
  referred_user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'signed_up' check (status in ('signed_up','qualified','paid')),
  created_at timestamptz not null default now()
);
alter table public.affiliate_referrals enable row level security;
drop policy if exists affiliate_referral_owner_read on public.affiliate_referrals;
create policy affiliate_referral_owner_read on public.affiliate_referrals for select
  using(exists(select 1 from public.affiliate_accounts a where a.id = affiliate_id and a.user_id = auth.uid()));

create or replace function public.record_affiliate_conversion(referral_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  affiliate_record public.affiliate_accounts;
begin
  if auth.uid() is null or referral_code !~ '^[a-z0-9-]{4,48}$' then return false; end if;
  select * into affiliate_record from public.affiliate_accounts where code = referral_code and status = 'active';
  if not found or affiliate_record.user_id = auth.uid() then return false; end if;
  insert into public.affiliate_referrals(affiliate_id, referred_user_id)
  values(affiliate_record.id, auth.uid()) on conflict(referred_user_id) do nothing;
  if found then
    update public.affiliate_accounts set conversion_count = conversion_count + 1 where id = affiliate_record.id;
    return true;
  end if;
  return false;
end;
$$;

revoke all on function public.record_affiliate_conversion(text) from public;
grant execute on function public.record_affiliate_conversion(text) to authenticated;

-- -----------------------------------------------------------------------------

-- Source: supabase/migrations/20260903050000_billing_and_email.sql

alter table public.profiles
  add column if not exists welcome_email_sent_at timestamptz;

alter table public.workspaces drop constraint if exists workspaces_plan_check;
alter table public.workspaces
  add constraint workspaces_plan_check
  check (plan in ('free','starter','creator','pro','studio','business','enterprise','agent-sandbox','agent-launch','agent-growth','agent-scale','agent-enterprise'));

alter table public.subscriptions
  add column if not exists price_id text,
  add column if not exists product_id text,
  add column if not exists currency_code text,
  add column if not exists next_billed_at timestamptz,
  add column if not exists scheduled_change jsonb,
  add column if not exists items jsonb not null default '[]'::jsonb;

create unique index if not exists subscriptions_provider_subscription_uidx
  on public.subscriptions(provider_subscription_id)
  where provider_subscription_id is not null;

create table if not exists public.billing_customers (
  provider_customer_id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  provider text not null default 'paddle',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists billing_customers_workspace_idx
  on public.billing_customers(workspace_id,updated_at desc);
create index if not exists billing_customers_email_idx
  on public.billing_customers(lower(email));

drop trigger if exists billing_customers_touch on public.billing_customers;
create trigger billing_customers_touch before update on public.billing_customers
  for each row execute function public.touch_updated_at();

alter table public.billing_customers enable row level security;
drop policy if exists billing_customers_workspace_read on public.billing_customers;
create policy billing_customers_workspace_read on public.billing_customers for select
  using(public.is_workspace_member(workspace_id));

create table if not exists public.billing_webhook_events (
  event_id text primary key,
  event_type text not null,
  provider text not null default 'paddle',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now()
);
alter table public.billing_webhook_events enable row level security;

alter table public.support_tickets
  add column if not exists last_reply text,
  add column if not exists last_replied_at timestamptz,
  add column if not exists last_replied_by uuid references auth.users(id) on delete set null;

create or replace function public.apply_paddle_credit_purchase(
  p_event_id text,
  p_event_type text,
  p_workspace_id uuid,
  p_user_id uuid,
  p_credits integer,
  p_transaction_id text,
  p_payload jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  if p_credits <= 0 then raise exception 'credits must be positive'; end if;

  insert into public.billing_webhook_events(event_id,event_type,payload)
  values(p_event_id,p_event_type,p_payload)
  on conflict(event_id) do nothing;
  if not found then
    select balance into v_balance from public.credit_wallets where workspace_id=p_workspace_id;
    return coalesce(v_balance,0);
  end if;

  update public.credit_wallets
     set balance=balance+p_credits,
         lifetime_granted=lifetime_granted+p_credits,
         updated_at=now()
   where workspace_id=p_workspace_id
   returning balance into v_balance;
  if v_balance is null then raise exception 'workspace wallet not found'; end if;

  insert into public.credit_transactions(
    workspace_id,user_id,transaction_type,status,amount,balance_after,description,metadata
  ) values(
    p_workspace_id,p_user_id,'top_up','settled',p_credits,v_balance,
    format('%s credit top-up',p_credits),
    jsonb_build_object('provider','paddle','transaction_id',p_transaction_id,'event_id',p_event_id)
  );
  return v_balance;
end;
$$;

revoke all on function public.apply_paddle_credit_purchase(text,text,uuid,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_paddle_credit_purchase(text,text,uuid,uuid,integer,text,jsonb) to service_role;

create or replace function public.apply_paddle_subscription_payment(
  p_event_id text,
  p_workspace_id uuid,
  p_user_id uuid,
  p_plan text,
  p_credits integer,
  p_transaction_id text,
  p_payload jsonb default '{}'::jsonb
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if auth.role() <> 'service_role' then raise exception 'service role required'; end if;
  if p_credits <= 0 then raise exception 'credits must be positive'; end if;

  insert into public.billing_webhook_events(event_id,event_type,payload)
  values(p_event_id,'transaction.completed',p_payload)
  on conflict(event_id) do nothing;
  if not found then
    select balance into v_balance from public.credit_wallets where workspace_id=p_workspace_id;
    return coalesce(v_balance,0);
  end if;

  update public.credit_wallets
     set balance=balance+p_credits,
         lifetime_granted=lifetime_granted+p_credits,
         updated_at=now()
   where workspace_id=p_workspace_id
   returning balance into v_balance;
  if v_balance is null then raise exception 'workspace wallet not found'; end if;

  insert into public.credit_transactions(
    workspace_id,user_id,transaction_type,status,amount,balance_after,description,metadata
  ) values(
    p_workspace_id,p_user_id,'grant','settled',p_credits,v_balance,
    format('%s plan credits',initcap(p_plan)),
    jsonb_build_object('provider','paddle','transaction_id',p_transaction_id,'event_id',p_event_id,'plan',p_plan)
  );
  return v_balance;
end;
$$;

revoke all on function public.apply_paddle_subscription_payment(text,uuid,uuid,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_paddle_subscription_payment(text,uuid,uuid,text,integer,text,jsonb) to service_role;

comment on table public.billing_webhook_events is
  'Idempotency ledger for signed billing webhooks. Never writable from the browser.';

-- -----------------------------------------------------------------------------

-- Source: supabase/migrations/20260903030000_mcp_api_keys.sql

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
