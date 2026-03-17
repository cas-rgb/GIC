create table if not exists province_demographics_yearly (
  id uuid primary key default gen_random_uuid(),
  province_code text not null,
  province_name text not null,
  year integer not null,
  population_total integer,
  households_total integer,
  unemployment_rate numeric(7,4),
  income_band_summary jsonb not null default '{}'::jsonb,
  service_access_water numeric(7,4),
  service_access_electricity numeric(7,4),
  service_access_sanitation numeric(7,4),
  language_profile jsonb not null default '{}'::jsonb,
  settlement_profile jsonb not null default '{}'::jsonb,
  economic_profile jsonb not null default '{}'::jsonb,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, year)
);

create index if not exists province_demographics_yearly_lookup_idx
  on province_demographics_yearly(province_name, year desc);

create table if not exists municipality_demographics_yearly (
  id uuid primary key default gen_random_uuid(),
  municipality_code text,
  municipality_name text not null,
  province_code text not null,
  province_name text not null,
  year integer not null,
  population_total integer,
  households_total integer,
  unemployment_rate numeric(7,4),
  income_band_summary jsonb not null default '{}'::jsonb,
  service_access_water numeric(7,4),
  service_access_electricity numeric(7,4),
  service_access_sanitation numeric(7,4),
  language_profile jsonb not null default '{}'::jsonb,
  settlement_profile jsonb not null default '{}'::jsonb,
  economic_profile jsonb not null default '{}'::jsonb,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, municipality_name, year)
);

create index if not exists municipality_demographics_yearly_lookup_idx
  on municipality_demographics_yearly(province_name, municipality_name, year desc);

create table if not exists ward_demographics_yearly (
  id uuid primary key default gen_random_uuid(),
  ward_key text,
  ward_number integer,
  ward_name text not null,
  municipality_code text,
  municipality_name text not null,
  province_code text not null,
  province_name text not null,
  year integer not null,
  population_total integer,
  households_total integer,
  unemployment_rate numeric(7,4),
  income_band_summary jsonb not null default '{}'::jsonb,
  service_access_water numeric(7,4),
  service_access_electricity numeric(7,4),
  service_access_sanitation numeric(7,4),
  language_profile jsonb not null default '{}'::jsonb,
  settlement_profile jsonb not null default '{}'::jsonb,
  economic_profile jsonb not null default '{}'::jsonb,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, municipality_name, ward_name, year)
);

create index if not exists ward_demographics_yearly_lookup_idx
  on ward_demographics_yearly(province_name, municipality_name, ward_name, year desc);
