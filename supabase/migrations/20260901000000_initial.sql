create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner','admin','member');
create type public.generation_status as enum ('queued','planning','generating','processing','completed','failed','cancelled');
create type public.generation_capability as enum ('text','image','video','speech','transcription','avatar');
create type public.asset_kind as enum ('image','video','audio','document','logo','avatar','export','upload');
create type public.credit_transaction_type as enum ('grant','reserve','debit','refund','adjustment','top_up');
create type public.credit_transaction_status as enum ('pending','settled','void');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  primary_intent text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free','creator','pro','studio','business')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  name text not null,
  website text,
  logo_asset_id uuid,
  colors jsonb not null default '[]'::jsonb,
  typography jsonb not null default '{}'::jsonb,
  industry text,
  description text,
  positioning text,
  target_audience text,
  tone text[] not null default '{}',
  visual_style text[] not null default '{}',
  preferred_phrases text[] not null default '{}',
  banned_phrases text[] not null default '{}',
  source_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  created_by uuid not null references auth.users(id),
  name text not null,
  description text,
  features text[] not null default '{}',
  usp text,
  price text,
  target_audience text,
  usage text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.voices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  created_by uuid references auth.users(id),
  provider text not null,
  provider_voice_id text not null,
  model_id text not null,
  display_name text not null,
  language text,
  accent text,
  presentation text,
  styles text[] not null default '{}',
  use_cases text[] not null default '{}',
  preview_asset_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.avatars (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  default_voice_id uuid references public.voices(id) on delete set null,
  name text not null,
  source_type text not null check (source_type in ('generated','authorized_upload','stock')),
  appearance jsonb not null default '{}'::jsonb,
  personality text,
  speaking_style text,
  preferred_language text,
  tags text[] not null default '{}',
  consent_confirmed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  brand_id uuid references public.brands(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  avatar_id uuid references public.avatars(id) on delete set null,
  title text not null,
  project_type text not null,
  status text not null default 'draft',
  prompt text,
  concept jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  thumbnail_asset_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_scenes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  position integer not null,
  title text not null,
  description text,
  visual_prompt text,
  voiceover text,
  on_screen_text text,
  duration_seconds numeric(7,2),
  status public.generation_status not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id,position)
);

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  scene_id uuid references public.project_scenes(id) on delete set null,
  parent_generation_id uuid references public.generations(id) on delete set null,
  capability public.generation_capability not null,
  status public.generation_status not null default 'queued',
  provider text not null default 'openrouter',
  provider_job_id text,
  provider_generation_id text,
  model_id text not null,
  model_snapshot jsonb not null default '{}'::jsonb,
  prompt text not null,
  negative_prompt text,
  parameters jsonb not null default '{}'::jsonb,
  credit_cost integer not null default 0 check (credit_cost >= 0),
  provider_estimated_cost numeric(12,6),
  provider_actual_cost numeric(12,6),
  idempotency_key text not null,
  attempt integer not null default 1,
  error_code text,
  error_message text,
  output_metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,idempotency_key)
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  generation_id uuid references public.generations(id) on delete set null,
  kind public.asset_kind not null,
  r2_key text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  width integer,
  height integer,
  duration_seconds numeric(10,3),
  source text not null,
  model_id text,
  metadata jsonb not null default '{}'::jsonb,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.brands add constraint brands_logo_asset_fk foreign key (logo_asset_id) references public.assets(id) on delete set null;
alter table public.voices add constraint voices_preview_asset_fk foreign key (preview_asset_id) references public.assets(id) on delete set null;
alter table public.projects add constraint projects_thumbnail_asset_fk foreign key (thumbnail_asset_id) references public.assets(id) on delete set null;

create table public.brand_assets (
  brand_id uuid not null references public.brands(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  purpose text not null default 'reference',
  primary key (brand_id,asset_id)
);
create table public.product_assets (
  product_id uuid not null references public.products(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  purpose text not null default 'reference',
  primary key (product_id,asset_id)
);
create table public.avatar_assets (
  avatar_id uuid not null references public.avatars(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  purpose text not null default 'reference',
  primary key (avatar_id,asset_id)
);
create table public.generation_assets (
  generation_id uuid not null references public.generations(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  role text not null default 'output',
  position integer not null default 0,
  primary key (generation_id,asset_id)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_id,entity_type,entity_id)
);

create table public.credit_wallets (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_granted integer not null default 0,
  lifetime_used integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  generation_id uuid references public.generations(id) on delete set null,
  transaction_type public.credit_transaction_type not null,
  status public.credit_transaction_status not null default 'settled',
  amount integer not null,
  balance_after integer not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.model_registry (
  id text primary key,
  provider text not null,
  capability public.generation_capability not null,
  display_name text not null,
  quality_tier text not null,
  capabilities jsonb not null default '{}'::jsonb,
  enabled boolean not null default true,
  fallback_model text,
  discovered_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.model_pricing (
  id uuid primary key default gen_random_uuid(),
  model_id text not null references public.model_registry(id) on delete cascade,
  effective_from timestamptz not null default now(),
  provider_cost jsonb not null default '{}'::jsonb,
  credit_formula jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid references public.generations(id) on delete set null,
  event_type text not null,
  capability text,
  model_id text,
  quantity numeric,
  provider_cost numeric(12,6),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index brands_workspace_idx on public.brands(workspace_id,updated_at desc);
create index products_workspace_idx on public.products(workspace_id,updated_at desc);
create index avatars_workspace_idx on public.avatars(workspace_id,updated_at desc);
create index projects_workspace_idx on public.projects(workspace_id,updated_at desc);
create index scenes_project_idx on public.project_scenes(project_id,position);
create index generations_user_status_idx on public.generations(user_id,status,created_at desc);
create index generations_project_idx on public.generations(project_id,created_at desc);
create index generations_provider_job_idx on public.generations(provider_job_id) where provider_job_id is not null;
create index assets_workspace_kind_idx on public.assets(workspace_id,kind,created_at desc) where deleted_at is null;
create index credit_transactions_workspace_idx on public.credit_transactions(workspace_id,created_at desc);
create index usage_events_user_time_idx on public.usage_events(user_id,created_at desc);

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.workspace_members where workspace_id = p_workspace_id and user_id = auth.uid());
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

do $$ declare t text; begin
  foreach t in array array['profiles','workspaces','brands','products','avatars','projects','project_scenes','generations','subscriptions'] loop
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_workspace_id uuid; v_slug text;
begin
  insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)));
  v_slug := lower(regexp_replace(coalesce(split_part(new.email,'@',1),'workspace'),'[^a-z0-9]+','-','g')) || '-' || left(replace(new.id::text,'-',''),6);
  insert into public.workspaces(name,slug,owner_id) values(coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)) || '''s studio',v_slug,new.id) returning id into v_workspace_id;
  insert into public.workspace_members(workspace_id,user_id,role) values(v_workspace_id,new.id,'owner');
  insert into public.credit_wallets(workspace_id,balance,lifetime_granted) values(v_workspace_id,50,50);
  insert into public.credit_transactions(workspace_id,user_id,transaction_type,status,amount,balance_after,description) values(v_workspace_id,new.id,'grant','settled',50,50,'Free plan welcome credits');
  insert into public.subscriptions(workspace_id,plan,status) values(v_workspace_id,'free','active');
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.reserve_credits(p_user_id uuid,p_generation_id uuid,p_amount integer,p_description text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_workspace_id uuid; v_balance integer;
begin
  if p_user_id <> auth.uid() and auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
  select workspace_id into v_workspace_id from public.generations where id=p_generation_id and user_id=p_user_id for update;
  if v_workspace_id is null then raise exception 'generation not found'; end if;
  if exists(select 1 from public.credit_transactions where generation_id=p_generation_id and transaction_type='reserve' and status in ('pending','settled')) then
    select balance into v_balance from public.credit_wallets where workspace_id=v_workspace_id; return v_balance;
  end if;
  update public.credit_wallets set balance=balance-p_amount,lifetime_used=lifetime_used+p_amount,updated_at=now()
    where workspace_id=v_workspace_id and balance>=p_amount returning balance into v_balance;
  if v_balance is null then raise exception 'insufficient credits'; end if;
  insert into public.credit_transactions(workspace_id,user_id,generation_id,transaction_type,status,amount,balance_after,description)
    values(v_workspace_id,p_user_id,p_generation_id,'reserve','pending',-p_amount,v_balance,p_description);
  return v_balance;
end; $$;

create or replace function public.settle_credits(p_user_id uuid,p_generation_id uuid,p_actual_amount integer default null)
returns void language plpgsql security definer set search_path = public as $$
declare v_tx public.credit_transactions%rowtype; v_difference integer; v_balance integer;
begin
  if p_user_id <> auth.uid() and auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
  select * into v_tx from public.credit_transactions where generation_id=p_generation_id and transaction_type='reserve' and status='pending' for update;
  if not found then return; end if;
  if p_actual_amount is not null and p_actual_amount < abs(v_tx.amount) then
    v_difference := abs(v_tx.amount)-p_actual_amount;
    update public.credit_wallets set balance=balance+v_difference,lifetime_used=lifetime_used-v_difference,updated_at=now() where workspace_id=v_tx.workspace_id returning balance into v_balance;
    insert into public.credit_transactions(workspace_id,user_id,generation_id,transaction_type,status,amount,balance_after,description) values(v_tx.workspace_id,p_user_id,p_generation_id,'refund','settled',v_difference,v_balance,'Unused generation credit release');
  end if;
  update public.credit_transactions set status='settled' where id=v_tx.id;
end; $$;

create or replace function public.refund_generation_credits(p_user_id uuid,p_generation_id uuid,p_reason text)
returns void language plpgsql security definer set search_path = public as $$
declare v_tx public.credit_transactions%rowtype; v_balance integer;
begin
  if p_user_id <> auth.uid() and auth.role() <> 'service_role' then raise exception 'unauthorized'; end if;
  select * into v_tx from public.credit_transactions where generation_id=p_generation_id and transaction_type='reserve' and status='pending' for update;
  if not found then return; end if;
  update public.credit_wallets set balance=balance+abs(v_tx.amount),lifetime_used=lifetime_used-abs(v_tx.amount),updated_at=now() where workspace_id=v_tx.workspace_id returning balance into v_balance;
  update public.credit_transactions set status='void' where id=v_tx.id;
  insert into public.credit_transactions(workspace_id,user_id,generation_id,transaction_type,status,amount,balance_after,description) values(v_tx.workspace_id,p_user_id,p_generation_id,'refund','settled',abs(v_tx.amount),v_balance,p_reason);
end; $$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.avatars enable row level security;
alter table public.voices enable row level security;
alter table public.projects enable row level security;
alter table public.project_scenes enable row level security;
alter table public.generations enable row level security;
alter table public.assets enable row level security;
alter table public.brand_assets enable row level security;
alter table public.product_assets enable row level security;
alter table public.avatar_assets enable row level security;
alter table public.generation_assets enable row level security;
alter table public.favorites enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.model_registry enable row level security;
alter table public.model_pricing enable row level security;
alter table public.usage_events enable row level security;

create policy profiles_self on public.profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy workspaces_member_read on public.workspaces for select using(public.is_workspace_member(id));
create policy workspaces_owner_update on public.workspaces for update using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy members_member_read on public.workspace_members for select using(public.is_workspace_member(workspace_id));

do $$ declare t text; begin
  foreach t in array array['brands','products','avatars','projects','project_scenes','generations','assets','favorites','usage_events'] loop
    execute format('create policy %I_workspace_access on public.%I for all using(public.is_workspace_member(workspace_id)) with check(public.is_workspace_member(workspace_id))', t, t);
  end loop;
end $$;

create policy voices_system_or_workspace_read on public.voices for select using(is_system or (workspace_id is not null and public.is_workspace_member(workspace_id)));
create policy voices_workspace_write on public.voices for all using(workspace_id is not null and public.is_workspace_member(workspace_id)) with check(workspace_id is not null and public.is_workspace_member(workspace_id));
create policy wallets_member_read on public.credit_wallets for select using(public.is_workspace_member(workspace_id));
create policy transactions_member_read on public.credit_transactions for select using(public.is_workspace_member(workspace_id));
create policy subscriptions_member_read on public.subscriptions for select using(public.is_workspace_member(workspace_id));
create policy model_registry_public_read on public.model_registry for select using(enabled=true);
create policy model_pricing_public_read on public.model_pricing for select using(active=true);

create policy brand_assets_access on public.brand_assets for all using(exists(select 1 from public.brands b where b.id=brand_id and public.is_workspace_member(b.workspace_id))) with check(exists(select 1 from public.brands b where b.id=brand_id and public.is_workspace_member(b.workspace_id)));
create policy product_assets_access on public.product_assets for all using(exists(select 1 from public.products p where p.id=product_id and public.is_workspace_member(p.workspace_id))) with check(exists(select 1 from public.products p where p.id=product_id and public.is_workspace_member(p.workspace_id)));
create policy avatar_assets_access on public.avatar_assets for all using(exists(select 1 from public.avatars a where a.id=avatar_id and public.is_workspace_member(a.workspace_id))) with check(exists(select 1 from public.avatars a where a.id=avatar_id and public.is_workspace_member(a.workspace_id)));
create policy generation_assets_access on public.generation_assets for all using(exists(select 1 from public.generations g where g.id=generation_id and public.is_workspace_member(g.workspace_id))) with check(exists(select 1 from public.generations g where g.id=generation_id and public.is_workspace_member(g.workspace_id)));

revoke update,delete on public.credit_transactions from authenticated;
grant execute on function public.reserve_credits(uuid,uuid,integer,text) to authenticated,service_role;
grant execute on function public.settle_credits(uuid,uuid,integer) to authenticated,service_role;
grant execute on function public.refund_generation_credits(uuid,uuid,text) to authenticated,service_role;

insert into public.model_registry(id,provider,capability,display_name,quality_tier,capabilities,enabled,fallback_model) values
('google/gemini-3.7-flash','google','text','Creative Director','standard','{}',true,'openai/gpt-5.4-mini'),
('google/gemini-3.1-flash-lite-image','google','image','Studio Image Fast','fast','{"reference_images":true}',true,'openai/gpt-image-1-mini'),
('google/gemini-3.1-flash-image','google','image','Studio Image','standard','{"reference_images":true}',true,'bytedance-seed/seedream-5-0-lite'),
('bytedance-seed/seedream-5-0-pro','bytedance-seed','image','Reference Studio','premium','{"reference_images":true}',true,'openai/gpt-image-2'),
('bytedance/seedance-2.0-mini','bytedance','video','Motion Draft','fast','{"audio":true,"references":true}',true,'bytedance/seedance-2.0-fast'),
('bytedance/seedance-2.5','bytedance','video','Motion Studio','standard','{"audio":true,"references":true}',true,'kwaivgi/kling-v3.0-std'),
('google/veo-3.1','google','video','Cinematic Premium','premium','{"audio":true,"references":true}',true,'google/veo-3.1-fast'),
('heygen/avatar-iv','heygen','avatar','Avatar Studio','premium','{"audio":true,"avatar":true}',true,null),
('google/gemini-3.1-flash-tts-preview','google','speech','Expressive Voice','standard','{}',true,'microsoft/mai-voice-2-flash'),
('fish-audio/s2.1-pro','fish-audio','speech','Voice Premium','premium','{}',true,'google/gemini-3.1-flash-tts-preview'),
('openai/gpt-4o-mini-transcribe','openai','transcription','Smart Transcript','standard','{}',true,'openai/whisper-large-v3-turbo');

insert into public.model_pricing(model_id,provider_cost,credit_formula) select id,'{}'::jsonb,
  case capability when 'image' then '{"base":12,"per_output":12}'::jsonb when 'video' then '{"base":60,"per_five_seconds":60}'::jsonb when 'speech' then '{"base":3,"per_1000_characters":3}'::jsonb when 'transcription' then '{"base":3,"per_minute":3}'::jsonb else '{"base":1}'::jsonb end
from public.model_registry;
