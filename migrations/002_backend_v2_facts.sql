create table if not exists fact_service_pressure_daily (
  day date not null,
  province text not null,
  municipality text,
  service_domain text not null,
  pressure_case_count integer not null,
  high_severity_count integer not null,
  protest_count integer not null,
  response_count integer not null,
  avg_classification_confidence numeric(5,3) not null,
  source_document_count integer not null,
  primary key (day, province, municipality, service_domain)
);

create table if not exists fact_source_reliability_daily (
  day date not null,
  province text not null,
  source_type text not null,
  source_count integer not null,
  avg_reliability_score numeric(5,3) not null,
  document_count integer not null,
  primary key (day, province, source_type)
);
