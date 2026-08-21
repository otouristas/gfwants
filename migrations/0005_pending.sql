create table if not exists pending_payments (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
