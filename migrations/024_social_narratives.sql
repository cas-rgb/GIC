create table if not exists social_narratives (
  id uuid primary key default gen_random_uuid(),
  province text not null,
  title text not null,
  status text not null, -- 'Trending Up', 'Stabilizing', 'Decreasing'
  threat_level text not null, -- 'Critical', 'Elevated', 'Low'
  description text not null,
  source_platform text, -- 'X', 'LinkedIn', 'Facebook', 'Threads', 'Instagram'
  created_at timestamptz not null default now()
);

create index if not exists idx_social_narratives_province on social_narratives(province);
create index if not exists idx_social_narratives_created_at on social_narratives(created_at desc);
