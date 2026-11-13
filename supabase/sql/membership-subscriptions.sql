-- DigiYar paid subscription entitlement storage.
-- Apply only after the linked Supabase project is active and authentication is configured.
-- This table stores subscription state, never payment-card or bank credentials.
create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null check (plan_id in ('professional', 'commercial')),
  status text not null default 'pending' check (status in ('pending', 'active', 'canceled', 'expired', 'refunded')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  source text not null default 'admin_grant' check (source in ('admin_grant', 'payment_provider', 'migration')),
  provider_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_valid_period check (ends_at > starts_at)
);
create index if not exists user_subscriptions_user_period_idx
  on public.user_subscriptions (user_id, ends_at desc);
alter table public.user_subscriptions enable row level security;
revoke all on table public.user_subscriptions from anon, authenticated;
grant select, insert, update on table public.user_subscriptions to service_role;
