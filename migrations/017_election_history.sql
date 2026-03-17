create table if not exists province_election_results (
  id uuid primary key default gen_random_uuid(),
  province_code text not null,
  province_name text not null,
  election_year integer not null,
  election_type text not null,
  party_name text not null,
  votes integer,
  vote_share numeric(7,4),
  turnout numeric(7,4),
  winner_flag boolean not null default false,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, election_year, election_type, party_name)
);

create index if not exists province_election_results_lookup_idx
  on province_election_results(province_name, election_year desc);

create table if not exists municipality_election_results (
  id uuid primary key default gen_random_uuid(),
  municipality_code text,
  municipality_name text not null,
  province_code text not null,
  province_name text not null,
  election_year integer not null,
  election_type text not null,
  party_name text not null,
  votes integer,
  vote_share numeric(7,4),
  turnout numeric(7,4),
  winner_flag boolean not null default false,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, municipality_name, election_year, election_type, party_name)
);

create index if not exists municipality_election_results_lookup_idx
  on municipality_election_results(province_name, municipality_name, election_year desc);

create table if not exists ward_election_results (
  id uuid primary key default gen_random_uuid(),
  ward_key text,
  ward_number integer,
  ward_name text not null,
  municipality_code text,
  municipality_name text not null,
  province_code text not null,
  province_name text not null,
  election_year integer not null,
  election_type text not null,
  party_name text not null,
  candidate_name text,
  votes integer,
  vote_share numeric(7,4),
  turnout numeric(7,4),
  winner_flag boolean not null default false,
  source_name text not null,
  source_url text,
  retrieved_at timestamptz not null default now(),
  unique (province_name, municipality_name, ward_name, election_year, election_type, party_name, candidate_name)
);

create index if not exists ward_election_results_lookup_idx
  on ward_election_results(province_name, municipality_name, ward_name, election_year desc);
