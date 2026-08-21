create table if not exists listings (
  id serial primary key,
  category text not null,
  name text not null,
  url text not null,
  tagline text not null default '',
  bid_cents integer not null,
  clicks integer not null default 0,
  takeover_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists listings_category_url_idx
  on listings (category, url);

create index if not exists listings_rank_idx
  on listings (bid_cents desc, created_at asc);

create table if not exists activity (
  id serial primary key,
  listing_id integer references listings (id) on delete set null,
  kind text not null,
  amount_cents integer,
  category text,
  name text,
  created_at timestamptz not null default now()
);

create index if not exists activity_created_idx
  on activity (created_at desc);

create table if not exists site_stats (
  id integer primary key,
  visitors integer not null default 0,
  constraint site_stats_one_row check (id = 1)
);
