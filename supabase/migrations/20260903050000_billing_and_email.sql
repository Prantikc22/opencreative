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
