-- Add Service Delivery Category classification to AI Narratives
ALTER TABLE ai_narrative_synthesis ADD COLUMN service_category text;
create index if not exists idx_ai_synth_category on ai_narrative_synthesis(service_category);
