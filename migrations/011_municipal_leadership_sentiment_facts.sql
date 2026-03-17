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

create index if not exists fact_municipal_leadership_sentiment_daily_municipality_idx
  on fact_municipal_leadership_sentiment_daily(province, municipality);
