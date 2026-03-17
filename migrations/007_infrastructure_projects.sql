create table if not exists infrastructure_projects (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id),
  document_id uuid references documents(id) on delete set null,
  location_id uuid references locations(id) on delete set null,
  external_project_id text not null unique,
  project_number text,
  project_name text not null,
  province text not null,
  municipality text,
  district text,
  geography_level text,
  function_name text,
  asset_class text,
  asset_subclass text,
  project_type text,
  project_description text,
  ward_location text,
  municipality_category text,
  latest_budget_year text,
  latest_budget_phase text,
  latest_amount numeric(18,2),
  total_known_expenditure numeric(18,2),
  source_url text not null,
  parser_version text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists infrastructure_projects_province_idx
  on infrastructure_projects(province);

create index if not exists infrastructure_projects_municipality_idx
  on infrastructure_projects(municipality);

create table if not exists project_funding_sources (
  id uuid primary key default gen_random_uuid(),
  infrastructure_project_id uuid not null references infrastructure_projects(id) on delete cascade,
  financial_year text,
  budget_phase text,
  amount numeric(18,2) not null,
  source_document_id uuid references documents(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists project_funding_sources_project_idx
  on project_funding_sources(infrastructure_project_id);

create table if not exists project_updates (
  id uuid primary key default gen_random_uuid(),
  infrastructure_project_id uuid not null references infrastructure_projects(id) on delete cascade,
  source_document_id uuid references documents(id) on delete set null,
  update_type text not null,
  update_summary text not null,
  effective_date timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists project_updates_project_idx
  on project_updates(infrastructure_project_id);
