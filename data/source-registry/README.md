# Official Source Registry

This folder stores the real-data source registry for the governed v2 platform.

Rules:

- `verified_official_sources.csv` contains only sources that were individually verified from official primary pages.
- `verified_trusted_media_sources.csv` contains individually verified media outlets that are acceptable as secondary evidence sources.
- `verified_civic_research_sources.csv` contains individually verified NGOs, watchdogs, and research organisations that can strengthen situational awareness and recommendation context.
- `verified_social_accounts.csv` contains individually verified social accounts. These are account-level whitelist entries, not platform-level trust.
- `citizen_voice_query_packs.csv` contains governed public-social query packs for ordinary citizen voice collection. These are sentiment and evidence inputs, not KPI truth.
- Do not add guessed URLs, guessed municipality pages, or synthetic institutions.
- If a source is known to exist in an official directory but has not been individually verified yet, track it in `official_source_expansion_targets.md` rather than adding a fake row.
- Executive dashboards must use only `verification_status=verified` sources for decision-grade KPIs.
- Social media should be managed through account whitelists, not platform-level trust. See `social_ingestion_policy.md`.
- Citizen voice query packs should be managed as governed search definitions with province and issue scope. They must remain evidence-only and sentiment-only.
- NGOs and research organisations should not overwrite official KPI truth; they should strengthen evidence, contradiction checking, and recommendation context.

Suggested ingestion priority:

1. National official KPI sources
2. Provincial government and treasury sources
3. Metro and district municipality sources
4. Priority local municipality sources
5. News and social evidence sources as secondary enrichment
