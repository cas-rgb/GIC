create table if not exists fact_water_reliability_daily (
  day date not null,
  province text not null,
  official_document_count integer not null,
  official_signal_count integer not null,
  official_incident_count integer not null,
  avg_source_reliability numeric(5,3) not null,
  water_reliability_score numeric(5,2) not null,
  primary key (day, province)
);

create index if not exists fact_water_reliability_daily_province_idx
  on fact_water_reliability_daily(province);
