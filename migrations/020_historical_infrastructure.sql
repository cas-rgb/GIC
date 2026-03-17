create table if not exists budget_allocations (
  id uuid primary key default gen_random_uuid(),
  geography_level text not null check (geography_level in ('province', 'municipality', 'ward')),
  province_name text not null,
  municipality_name text,
  ward_name text,
  issue_family text,
  service_domain text,
  period_year integer,
  budget_amount numeric(18,2),
  project_name text,
  project_status text,
  summary_text text,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists budget_allocations_lookup_idx
  on budget_allocations(geography_level, province_name, municipality_name, ward_name, period_year desc);

create table if not exists province_infrastructure_history (
  id uuid primary key default gen_random_uuid(),
  province_name text not null,
  issue_family text,
  service_domain text,
  event_date timestamptz,
  period_year integer,
  severity text,
  summary_text text not null,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists province_infrastructure_history_lookup_idx
  on province_infrastructure_history(province_name, period_year desc, event_date desc);

create table if not exists municipality_infrastructure_history (
  id uuid primary key default gen_random_uuid(),
  province_name text not null,
  municipality_name text not null,
  issue_family text,
  service_domain text,
  event_date timestamptz,
  period_year integer,
  severity text,
  summary_text text not null,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists municipality_infrastructure_history_lookup_idx
  on municipality_infrastructure_history(province_name, municipality_name, period_year desc, event_date desc);

create table if not exists ward_infrastructure_history (
  id uuid primary key default gen_random_uuid(),
  province_name text not null,
  municipality_name text not null,
  ward_name text not null,
  issue_family text,
  service_domain text,
  event_date timestamptz,
  period_year integer,
  severity text,
  summary_text text not null,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists ward_infrastructure_history_lookup_idx
  on ward_infrastructure_history(province_name, municipality_name, ward_name, period_year desc, event_date desc);

create table if not exists historical_issue_events (
  id uuid primary key default gen_random_uuid(),
  geography_level text not null check (geography_level in ('province', 'municipality', 'ward')),
  province_name text not null,
  municipality_name text,
  ward_name text,
  issue_family text,
  service_domain text,
  event_date timestamptz,
  period_year integer,
  severity text,
  summary_text text not null,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  retrieved_at timestamptz not null default now()
);

create index if not exists historical_issue_events_lookup_idx
  on historical_issue_events(geography_level, province_name, municipality_name, ward_name, period_year desc, event_date desc);
