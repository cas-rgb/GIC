create table if not exists sentiment_mentions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  location_id uuid references locations(id),
  source_type text not null,
  topic text not null,
  sentiment_label text not null check (sentiment_label in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(5,2) not null check (sentiment_score between 0 and 100),
  confidence numeric(5,3) not null check (confidence between 0 and 1),
  evidence_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists sentiment_mentions_document_idx
  on sentiment_mentions(document_id);

create index if not exists sentiment_mentions_location_idx
  on sentiment_mentions(location_id);

create table if not exists fact_sentiment_daily (
  day date not null,
  province text not null,
  municipality text,
  topic text not null,
  sentiment_score numeric(5,2) not null,
  negative_share numeric(5,3) not null,
  positive_share numeric(5,3) not null,
  mention_count integer not null,
  avg_confidence numeric(5,3) not null,
  primary key (day, province, municipality, topic)
);

create index if not exists fact_sentiment_daily_province_idx
  on fact_sentiment_daily(province);

create table if not exists fact_topic_share_daily (
  day date not null,
  province text not null,
  topic text not null,
  mention_count integer not null,
  share_of_voice numeric(5,3) not null,
  avg_confidence numeric(5,3) not null,
  primary key (day, province, topic)
);

create index if not exists fact_topic_share_daily_province_idx
  on fact_topic_share_daily(province);
