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
