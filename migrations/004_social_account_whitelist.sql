create table if not exists social_account_whitelist (
  id text primary key,
  platform text not null,
  account_name text not null,
  account_url text not null,
  account_owner text not null,
  owner_type text not null,
  province text,
  municipality text,
  sector text not null,
  data_role text not null,
  verification_status text not null,
  verification_reference text,
  notes text,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists social_account_whitelist_platform_idx
  on social_account_whitelist(platform);

create index if not exists social_account_whitelist_province_idx
  on social_account_whitelist(province);

create index if not exists social_account_whitelist_verification_idx
  on social_account_whitelist(verification_status);
