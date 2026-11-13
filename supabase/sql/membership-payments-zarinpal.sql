-- DigiYar membership payments via Zarinpal v4.
-- Apply in Supabase SQL editor only after the linked project is ACTIVE.
-- Amounts are persisted in both Toman (display/accounting) and Rial (Zarinpal API).
-- No card number, CVV2, expiry date, or raw provider payload is persisted.
create table if not exists public.membership_payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('professional','commercial')),
  months smallint not null check (months in (1,3,6,9,12)),
  discount_percent smallint not null check (discount_percent in (0,8,15,21,28)),
  amount_toman bigint not null check (amount_toman > 0),
  amount_rial bigint not null check (amount_rial = amount_toman * 10),
  provider text not null default 'zarinpal' check (provider = 'zarinpal'),
  status text not null default 'pending' check (status in ('pending','initiating','paid','failed','cancelled','expired','refunded')),
  idempotency_key text not null,
  provider_authority text unique,
  provider_reference text unique,
  checkout_url text,
  provider_request_locked_until timestamptz,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  paid_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,idempotency_key)
);
create index if not exists membership_payment_orders_user_created_idx
  on public.membership_payment_orders(user_id,created_at desc);
create index if not exists membership_payment_orders_pending_expiry_idx
  on public.membership_payment_orders(status,expires_at)
  where status in ('pending','initiating');

create table if not exists public.membership_payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.membership_payment_orders(id) on delete cascade,
  provider text not null check (provider='zarinpal'),
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  signature_valid boolean,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider,provider_event_id)
);
create index if not exists membership_payment_events_order_idx
  on public.membership_payment_events(order_id,created_at desc);

alter table public.membership_payment_orders enable row level security;
alter table public.membership_payment_events enable row level security;
revoke all on public.membership_payment_orders from anon,authenticated;
revoke all on public.membership_payment_events from anon,authenticated;
grant select,insert,update,delete on public.membership_payment_orders to service_role;
grant select,insert,update,delete on public.membership_payment_events to service_role;
grant usage on schema public to service_role;

create or replace function public.create_membership_payment_order(
  p_user_id uuid,p_plan_id text,p_months integer,p_discount_percent integer,
  p_amount_toman bigint,p_amount_rial bigint,p_idempotency_key text
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_monthly bigint;
  v_discount integer;
  v_expected bigint;
  v_order public.membership_payment_orders%rowtype;
begin
  if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
    raise exception 'service_role_required' using errcode='42501';
  end if;
  v_monthly := case p_plan_id when 'professional' then 199000 when 'commercial' then 499000 else null end;
  v_discount := case p_months when 1 then 0 when 3 then 8 when 6 then 15 when 9 then 21 when 12 then 28 else null end;
  if v_monthly is null or v_discount is null or p_discount_percent <> v_discount then
    raise exception 'invalid_plan_or_duration' using errcode='22023';
  end if;
  v_expected := round((v_monthly * p_months)::numeric * (100-v_discount) / 100)::bigint;
  if p_amount_toman <> v_expected or p_amount_rial <> v_expected*10 then
    raise exception 'amount_mismatch' using errcode='22023';
  end if;
  if p_idempotency_key !~ '^[A-Za-z0-9_-]{16,100}$' then
    raise exception 'invalid_idempotency_key' using errcode='22023';
  end if;
  insert into public.membership_payment_orders(
    user_id,plan_id,months,discount_percent,amount_toman,amount_rial,idempotency_key
  ) values (
    p_user_id,p_plan_id,p_months,v_discount,v_expected,v_expected*10,p_idempotency_key
  ) on conflict(user_id,idempotency_key) do nothing;
  select * into v_order from public.membership_payment_orders
   where user_id=p_user_id and idempotency_key=p_idempotency_key;
  if v_order.plan_id<>p_plan_id or v_order.months<>p_months or v_order.amount_toman<>v_expected then
    raise exception 'idempotency_key_reused_with_different_order' using errcode='22023';
  end if;
  return to_jsonb(v_order);
end;
$$;

create or replace function public.claim_membership_payment_request(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
    raise exception 'service_role_required' using errcode='42501';
  end if;
  update public.membership_payment_orders
     set status='initiating',provider_request_locked_until=now()+interval '2 minutes',updated_at=now()
   where id=p_order_id and status in ('pending','initiating')
     and provider_authority is null and expires_at>now()
     and (provider_request_locked_until is null or provider_request_locked_until<now());
  return found;
end;
$$;

create or replace function public.finalize_membership_payment(
  p_order_id uuid,p_provider_reference text,p_verified_amount_rial bigint
) returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_order public.membership_payment_orders%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_subscription_id uuid;
begin
  if current_setting('request.jwt.claim.role',true) is distinct from 'service_role' then
    raise exception 'service_role_required' using errcode='42501';
  end if;
  select * into v_order from public.membership_payment_orders where id=p_order_id for update;
  if not found then raise exception 'order_not_found' using errcode='P0002'; end if;
  if v_order.status='paid' then
    select id into v_subscription_id from public.user_subscriptions where provider_reference=p_provider_reference limit 1;
    return jsonb_build_object('paid',true,'already_paid',true,'subscription_id',v_subscription_id);
  end if;
  if v_order.status not in ('pending','initiating','expired') or v_order.provider<>'zarinpal' then
    raise exception 'order_not_payable' using errcode='22023';
  end if;
  if v_order.amount_rial<>p_verified_amount_rial then
    raise exception 'verified_amount_mismatch' using errcode='22023';
  end if;
  if coalesce(trim(p_provider_reference),'')='' then
    raise exception 'provider_reference_required' using errcode='22023';
  end if;
  select greatest(now(),coalesce(max(ends_at),now())) into v_start
    from public.user_subscriptions
   where user_id=v_order.user_id and status='active' and ends_at>now();
  v_end:=v_start+make_interval(months=>v_order.months);
  update public.membership_payment_orders
     set status='paid',provider_reference=p_provider_reference,paid_at=now(),
         provider_request_locked_until=null,updated_at=now()
   where id=v_order.id;
  insert into public.user_subscriptions(
    user_id,plan_id,status,starts_at,ends_at,source,provider_reference
  ) values (
    v_order.user_id,v_order.plan_id,'active',v_start,v_end,'payment_provider',p_provider_reference
  ) returning id into v_subscription_id;
  return jsonb_build_object('paid',true,'already_paid',false,'subscription_id',v_subscription_id,'starts_at',v_start,'ends_at',v_end);
end;
$$;

revoke all on function public.create_membership_payment_order(uuid,text,integer,integer,bigint,bigint,text) from public,anon,authenticated;
revoke all on function public.claim_membership_payment_request(uuid) from public,anon,authenticated;
revoke all on function public.finalize_membership_payment(uuid,text,bigint) from public,anon,authenticated;
grant execute on function public.create_membership_payment_order(uuid,text,integer,integer,bigint,bigint,text) to service_role;
grant execute on function public.claim_membership_payment_request(uuid) to service_role;
grant execute on function public.finalize_membership_payment(uuid,text,bigint) to service_role;
