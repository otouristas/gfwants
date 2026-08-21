create table if not exists public.contributions (
  id bigint generated always as identity primary key,
  amount_cents integer not null,
  tier text not null,
  display_name text not null,
  x_handle text,
  message text not null default '',
  product_name text,
  product_url text,
  product_pitch text,
  stripe_session_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists contributions_product_url_uidx
  on public.contributions (product_url)
  where product_url is not null;

create unique index if not exists contributions_stripe_session_uidx
  on public.contributions (stripe_session_id)
  where stripe_session_id is not null;

alter table public.contributions enable row level security;

drop policy if exists "read wall" on public.contributions;
create policy "read wall" on public.contributions for select using (true);

drop policy if exists "insert wall" on public.contributions;
create policy "insert wall" on public.contributions for insert with check (true);
