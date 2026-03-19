-- Tracks high-fidelity, non-destructive AI narrative briefs 
-- for Social, Ward/Municipality, and Leadership.

create table if not exists ai_narrative_synthesis (
  id uuid primary key default gen_random_uuid(),
  
  -- Target identification
  lens text not null, -- 'social', 'municipality', 'leadership'
  province text not null,
  municipality text,
  ward text,
  leader_name text,

  -- WWWH Content
  who_involved text,
  what_happened text,
  why_it_happened text,
  how_resolved_or_current text,
  when_timeline text,
  
  -- Sourcing
  source_evidence text, -- Raw json or links returned by Tavily
  confidence_score float not null default 0.0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indices for fast lookups by the dashboards
create index if not exists idx_ai_synth_lens on ai_narrative_synthesis(lens);
create index if not exists idx_ai_synth_province on ai_narrative_synthesis(province);
create index if not exists idx_ai_synth_municipality on ai_narrative_synthesis(municipality);
create index if not exists idx_ai_synth_leader on ai_narrative_synthesis(leader_name);
