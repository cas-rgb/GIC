alter table sources
  add column if not exists last_attempted_at timestamptz,
  add column if not exists last_ingested_at timestamptz,
  add column if not exists last_error text;

create index if not exists sources_last_ingested_idx
  on sources(last_ingested_at);

create index if not exists sources_last_attempted_idx
  on sources(last_attempted_at);
