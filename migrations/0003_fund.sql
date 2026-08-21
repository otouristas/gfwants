create table if not exists contributions (
  id serial primary key,
  amount_cents integer not null,
  tier text not null,
  display_name text not null,
  x_handle text,
  message text not null default '',
  product_name text,
  product_url text,
  product_pitch text,
  created_at timestamptz not null default now()
);

create index if not exists contributions_amount_idx
  on contributions (amount_cents desc, created_at desc);

create index if not exists contributions_tier_idx
  on contributions (tier);
