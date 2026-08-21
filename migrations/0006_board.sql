alter table contributions add column if not exists click_count integer not null default 0;

create table if not exists visitor_pings (
  visitor_id text primary key,
  seen_at timestamptz not null default now()
);
