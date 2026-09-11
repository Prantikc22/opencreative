alter table public.billing_customers alter column provider set default 'dodo';
alter table public.billing_webhook_events alter column provider set default 'dodo';

create or replace function public.apply_dodo_credit_purchase(
  p_event_id text,
  p_event_type text,
  p_workspace_id uuid,
  p_user_id uuid,
  p_credits integer,
  p_payment_id text,
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

  insert into public.billing_webhook_events(event_id,event_type,provider,payload)
  values(p_event_id,p_event_type,'dodo',p_payload)
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
    jsonb_build_object('provider','dodo','payment_id',p_payment_id,'event_id',p_event_id)
  );
  return v_balance;
end;
$$;

revoke all on function public.apply_dodo_credit_purchase(text,text,uuid,uuid,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_dodo_credit_purchase(text,text,uuid,uuid,integer,text,jsonb) to service_role;

create or replace function public.apply_dodo_subscription_payment(
  p_event_id text,
  p_workspace_id uuid,
  p_user_id uuid,
  p_plan text,
  p_credits integer,
  p_payment_id text,
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

  insert into public.billing_webhook_events(event_id,event_type,provider,payload)
  values(p_event_id,'payment.succeeded','dodo',p_payload)
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
    jsonb_build_object('provider','dodo','payment_id',p_payment_id,'event_id',p_event_id,'plan',p_plan)
  );
  return v_balance;
end;
$$;

revoke all on function public.apply_dodo_subscription_payment(text,uuid,uuid,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_dodo_subscription_payment(text,uuid,uuid,text,integer,text,jsonb) to service_role;
