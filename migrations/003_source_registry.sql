create table if not exists source_registry (
  id text primary key,
  source_name text not null,
  source_url text not null,
  source_owner text not null,
  source_type text not null,
  sphere text not null,
  province text,
  municipality text,
  sector text not null,
  data_role text not null,
  update_frequency text,
  access_method text not null,
  reliability_tier text not null,
  verification_status text not null,
  verification_reference text,
  notes text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists source_registry_province_idx
  on source_registry(province);

create index if not exists source_registry_sphere_idx
  on source_registry(sphere);

create index if not exists source_registry_type_idx
  on source_registry(source_type);

create index if not exists source_registry_verification_idx
  on source_registry(verification_status);
