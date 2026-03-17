create table if not exists municipal_leader_mentions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  location_id uuid references locations(id),
  province text not null,
  municipality text not null,
  leader_name text not null,
  office text not null,
  topic text not null,
  sentiment_label text not null check (sentiment_label in ('positive', 'neutral', 'negative')),
  sentiment_score numeric(5,2) not null check (sentiment_score between 0 and 100),
  confidence numeric(5,3) not null check (confidence between 0 and 1),
  evidence_text text not null,
  created_at timestamptz not null default now()
);

create index if not exists municipal_leader_mentions_document_idx
  on municipal_leader_mentions(document_id);

create index if not exists municipal_leader_mentions_municipality_idx
  on municipal_leader_mentions(province, municipality);

create table if not exists fact_municipal_leadership_sentiment_daily (
  day date not null,
  province text not null,
  municipality text not null,
  leader_name text not null,
  office text not null,
  topic text not null,
  sentiment_score numeric(5,2) not null,
  negative_share numeric(5,3) not null,
  positive_share numeric(5,3) not null,
  mention_count integer not null,
  avg_confidence numeric(5,3) not null,
  primary key (day, province, municipality, leader_name, office, topic)
);

create index if not exists fact_municipal_leadership_sentiment_daily_lookup_idx
  on fact_municipal_leadership_sentiment_daily(province, municipality);
