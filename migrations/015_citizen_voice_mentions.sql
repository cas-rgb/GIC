create table if not exists citizen_voice_mentions (
  id uuid primary key default gen_random_uuid(),
  query_pack_id text not null references citizen_voice_query_packs(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  province text not null,
  municipality text null,
  issue_family text not null,
  source_type text not null,
  sentiment_label text not null check (sentiment_label in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(5,2) not null check (sentiment_score between 0 and 100),
  confidence numeric(5,3) not null check (confidence between 0 and 1),
  evidence_text text not null,
  created_at timestamptz not null default now(),
  unique (query_pack_id, document_id)
);

create index if not exists idx_citizen_voice_mentions_province
  on citizen_voice_mentions (province);

create index if not exists idx_citizen_voice_mentions_issue_family
  on citizen_voice_mentions (issue_family);

create index if not exists idx_citizen_voice_mentions_document
  on citizen_voice_mentions (document_id);

create table if not exists fact_citizen_voice_daily (
  day date not null,
  province text not null,
  municipality text null,
  issue_family text not null,
  mention_count integer not null,
  document_count integer not null,
  negative_share numeric(5,3) not null,
  avg_sentiment_score numeric(5,2) not null,
  avg_confidence numeric(5,3) not null,
  primary key (day, province, municipality, issue_family)
);

create index if not exists idx_fact_citizen_voice_daily_province
  on fact_citizen_voice_daily (province);
