create extension if not exists pgcrypto;

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null check (source_type in ('news', 'gov', 'internal', 'social', 'ngo')),
  base_url text,
  reliability_score numeric(4,3) not null default 0.500,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  province text,
  district text,
  municipality text,
  ward text,
  lat numeric(9,6),
  lng numeric(9,6),
  location_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sources(id),
  location_id uuid references locations(id),
  external_id text,
  url text not null,
  title text not null,
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  doc_type text not null check (doc_type in ('article', 'report', 'tender', 'budget', 'notice')),
  language text not null default 'en',
  content_text text not null,
  content_hash text unique,
  parser_version text not null,
  status text not null default 'active' check (status in ('active', 'archived', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists documents_source_idx on documents(source_id);
create index if not exists documents_location_idx on documents(location_id);
create index if not exists documents_published_idx on documents(published_at);

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  location_id uuid references locations(id),
  sector text not null check (sector in ('Civil', 'Roads', 'Health', 'Planning', 'Structural', 'Apex')),
  signal_type text not null,
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  severity_score numeric(5,2) not null check (severity_score between 0 and 100),
  urgency_score numeric(5,2) not null check (urgency_score between 0 and 100),
  confidence_score numeric(5,3) not null check (confidence_score between 0 and 1),
  event_date timestamptz,
  summary_text text not null,
  source_url text,
  status text not null default 'active' check (status in ('active', 'archived', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists signals_document_idx on signals(document_id);
create index if not exists signals_location_idx on signals(location_id);
create index if not exists signals_sector_idx on signals(sector);

create table if not exists service_incidents (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid not null references signals(id) on delete cascade,
  location_id uuid references locations(id),
  service_domain text not null,
  incident_type text not null,
  failure_indicator boolean not null default false,
  citizen_pressure_indicator boolean not null default false,
  protest_indicator boolean not null default false,
  response_indicator boolean not null default false,
  recurrence_indicator boolean not null default false,
  severity text not null check (severity in ('Low', 'Medium', 'High')),
  classification_confidence numeric(5,3) not null check (classification_confidence between 0 and 1),
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists service_incidents_signal_idx on service_incidents(signal_id);
create index if not exists service_incidents_location_idx on service_incidents(location_id);

create table if not exists tenders (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  location_id uuid references locations(id),
  sector text not null check (sector in ('Civil', 'Roads', 'Health', 'Planning', 'Structural', 'Apex')),
  title text not null,
  issuer text,
  closing_date timestamptz,
  estimated_value numeric(18,2),
  status text not null check (status in ('Open', 'Closed', 'Awarded', 'Cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  location_id uuid references locations(id),
  sector text not null check (sector in ('Civil', 'Roads', 'Health', 'Planning', 'Structural', 'Apex')),
  program_name text not null,
  budget_amount numeric(18,2) not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists document_processing_runs (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  parser_version text not null,
  passed boolean not null,
  extraction_confidence numeric(5,3) not null,
  errors jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_processing_runs_document_idx
  on document_processing_runs(document_id);

create table if not exists job_queue (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('ingest_document', 'process_document', 'embed_document', 'rebuild_daily_facts')),
  payload jsonb not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  run_after timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists job_queue_status_run_after_idx
  on job_queue(status, run_after);
