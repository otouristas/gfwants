alter table contributions
  add column if not exists stripe_session_id text;

create unique index if not exists contributions_stripe_session_uidx
  on contributions (stripe_session_id)
  where stripe_session_id is not null;
