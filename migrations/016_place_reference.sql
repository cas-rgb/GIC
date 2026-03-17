create table if not exists province_reference (
  id uuid primary key default gen_random_uuid(),
  province_code text not null unique,
  province_name text not null unique,
  source_name text not null,
  source_url text,
  created_at timestamptz not null default now()
);

create table if not exists municipality_reference (
  id uuid primary key default gen_random_uuid(),
  municipality_code text not null unique,
  municipality_name text not null,
  municipality_category text,
  district_name text,
  province_code text not null,
  province_name text not null,
  source_name text not null,
  source_url text,
  created_at timestamptz not null default now(),
  unique (province_name, municipality_name)
);

create index if not exists municipality_reference_province_idx
  on municipality_reference(province_name);

create table if not exists ward_reference (
  id uuid primary key default gen_random_uuid(),
  ward_key text not null unique,
  ward_number integer,
  ward_name text not null,
  municipality_code text,
  municipality_name text not null,
  district_name text,
  province_code text not null,
  province_name text not null,
  boundary_ref text,
  source_name text not null,
  source_url text,
  created_at timestamptz not null default now(),
  unique (province_name, municipality_name, ward_name)
);

create index if not exists ward_reference_province_idx
  on ward_reference(province_name);

create index if not exists ward_reference_municipality_idx
  on ward_reference(municipality_name);
