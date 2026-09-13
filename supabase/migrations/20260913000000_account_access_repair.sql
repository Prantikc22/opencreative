-- Existing users predate the onboarding gate. Mark the current population as
-- complete once; profiles created after this migration still start at false.
update public.profiles
set onboarding_completed = true,
    updated_at = now()
where onboarding_completed = false;

-- Every account can use the free Creative Studio and Agent Sandbox. A paid
-- plan upgrades its own family without deleting access to the other family.
update public.workspaces
set product_entitlements = jsonb_build_object(
  'creative', case
    when plan like 'agent-%' then coalesce(nullif(product_entitlements->>'creative', ''), 'free')
    else plan
  end,
  'agents', case
    when plan like 'agent-%' then plan
    else coalesce(nullif(product_entitlements->>'agents', ''), 'agent-sandbox')
  end
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_workspace_id uuid; v_slug text; v_product text; v_plan text; v_entitlements jsonb;
begin
  insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)));
  v_slug := lower(regexp_replace(coalesce(split_part(new.email,'@',1),'workspace'),'[^a-z0-9]+','-','g')) || '-' || left(replace(new.id::text,'-',''),6);
  v_product := case when new.raw_user_meta_data->>'desired_product' = 'agents' then 'agents' else 'creative' end;
  v_plan := case when v_product = 'agents' then 'agent-sandbox' else 'free' end;
  v_entitlements := '{"creative":"free","agents":"agent-sandbox"}'::jsonb;
  insert into public.workspaces(name,slug,owner_id,plan,product_entitlements)
    values(coalesce(new.raw_user_meta_data->>'full_name',split_part(new.email,'@',1)) || '''s studio',v_slug,new.id,v_plan,v_entitlements)
    returning id into v_workspace_id;
  insert into public.workspace_members(workspace_id,user_id,role) values(v_workspace_id,new.id,'owner');
  insert into public.credit_wallets(workspace_id,balance,lifetime_granted) values(v_workspace_id,case when v_product='creative' then 50 else 0 end,case when v_product='creative' then 50 else 0 end);
  if v_product = 'creative' then
    insert into public.credit_transactions(workspace_id,user_id,transaction_type,status,amount,balance_after,description) values(v_workspace_id,new.id,'grant','settled',50,50,'Free plan welcome credits');
  end if;
  insert into public.subscriptions(workspace_id,plan,status,metadata) values(v_workspace_id,v_plan,'active',jsonb_build_object('product_family',v_product));
  return new;
end; $$;
