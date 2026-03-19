-- Adding composite indices to speed up heavy dashboard GROUP BY API queries
CREATE INDEX IF NOT EXISTS idx_narrative_location ON ai_narrative_synthesis(province, municipality);
CREATE INDEX IF NOT EXISTS idx_narrative_lens ON ai_narrative_synthesis(lens);
