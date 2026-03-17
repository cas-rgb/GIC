alter table infrastructure_projects
  add column if not exists normalized_sector text,
  add column if not exists normalized_project_stage text,
  add column if not exists data_quality_flag text;

create table if not exists fact_infrastructure_projects_daily (
  day date not null,
  province text not null,
  municipality text not null,
  normalized_sector text not null,
  project_count integer not null,
  projects_with_budget_count integer not null,
  high_value_project_count integer not null,
  new_build_count integer not null,
  upgrade_count integer not null,
  renewal_count integer not null,
  total_known_expenditure numeric(18,2) not null,
  avg_latest_amount numeric(18,2),
  primary key (day, province, municipality, normalized_sector)
);

create index if not exists fact_infrastructure_projects_daily_province_idx
  on fact_infrastructure_projects_daily(province);
