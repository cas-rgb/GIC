create table if not exists citizen_voice_query_packs (
  id text primary key,
  scope_type text not null,
  scope_name text not null,
  platform text not null,
  issue_family text not null,
  query_text text not null,
  data_role text not null,
  verification_status text not null,
  notes text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_citizen_voice_query_packs_scope
  on citizen_voice_query_packs (scope_type, scope_name);

create index if not exists idx_citizen_voice_query_packs_issue
  on citizen_voice_query_packs (issue_family);
