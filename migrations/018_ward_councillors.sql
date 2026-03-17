create table if not exists ward_councillors (
  id uuid primary key default gen_random_uuid(),
  ward_key text,
  ward_number integer,
  ward_name text not null,
  municipality_code text,
  municipality_name text not null,
  province_code text not null,
  province_name text not null,
  councillor_name text not null,
  party_name text,
  office_title text,
  term_start date,
  term_end date,
  source_name text not null,
  source_url text,
  verification_tier text not null,
  confidence_score numeric(5,3),
  retrieved_at timestamptz not null default now(),
  unique (province_name, municipality_name, ward_name, councillor_name, source_name)
);

create index if not exists ward_councillors_lookup_idx
  on ward_councillors(province_name, municipality_name, ward_name);
