# Dashboard Data Inventory

This file is the working source of truth for the client-facing dashboard build.

The product scope is:

1. State of the Province
2. Leadership Sentiment
3. State of the Municipality & Wards
4. Social Media, News & Other Trends
5. Investor Profiling

The following are explicitly not part of the required client dashboard set:

- Province Comparison
- Municipality Comparison
- Governed Analytics

## 1. Active Data Layers

The solution currently has three distinct data layers.

### A. Postgres: Primary governed analytics layer

This is the main production-grade layer for the five required dashboards.

Core live tables currently present in Postgres:

- `documents`: `3978`
- `signals`: `1400`
- `service_incidents`: `915`
- `sentiment_mentions`: `1367`
- `citizen_voice_mentions`: `4153`
- `leader_mentions`: `8`
- `municipal_leader_mentions`: `29`
- `infrastructure_projects`: `4000`
- `project_funding_sources`: `5805`
- `project_updates`: `4000`
- `locations`: `688`
- `sources`: `55`
- `source_registry`: `129`

Derived fact tables:

- `fact_service_pressure_daily`: `110`
- `fact_sentiment_daily`: `412`
- `fact_topic_share_daily`: `286`
- `fact_citizen_voice_daily`: `232`
- `fact_leadership_sentiment_daily`: `8`
- `fact_municipal_leadership_sentiment_daily`: `29`
- `fact_infrastructure_projects_daily`: `328`
- `fact_source_reliability_daily`
- `fact_water_reliability_daily`

Supporting tables:

- `budgets`
- `citizen_voice_query_packs`
- `job_queue`
- `schema_migrations`
- `social_account_whitelist`
- `tenders`

### B. Firebase / Firestore: legacy and support layer

Firebase still exists in the solution and is still useful, but it should be treated as a support or import layer, not the main BI truth layer.

Observed Firestore collections referenced by scripts or legacy services:

- `community_signals`
- `community_issue`
- `service_pressure_case`
- `provincial_budget_topic_allocation`
- `location_resolved_signal`
- `gic_projects`
- `planningBudgets`
- `riskSignals`
- `leaders`
- `leadership`
- `news_articles`
- `strategicDatasets`
- `service_visual_analytics`
- `service_strategic_insights`
- `universal_signals`
- `tenders`
- `infrastructure_predictions`
- `evidenceSources`

Use Firebase for:

- legacy community signal fallback
- historic or imported civic/social evidence
- backfill and migration input

Do not use Firebase as the primary KPI truth layer for client dashboards unless the metric is explicitly marked as imported or legacy.

### C. Repo-local static and registry assets

These are configuration, seed, or fallback assets. They are not the main live dashboard truth layer.

Repo-local files:

- `data/source-registry/verified_official_sources.csv`
- `data/source-registry/verified_trusted_media_sources.csv`
- `data/source-registry/verified_civic_research_sources.csv`
- `data/source-registry/verified_social_accounts.csv`
- `data/source-registry/citizen_voice_query_packs.csv`
- `src/data/regional-registry.ts`
- `src/data/communities.ts`
- `src/data/query-library.ts`
- `src/data/mock-database.ts`

Use these for:

- source verification
- whitelists and ingestion rules
- controlled seed/demo fallback
- province/municipality/ward registry support where live metrics are sparse

Do not present `mock-database.ts` as live dashboard intelligence.

## 2. Dashboard-to-Data Mapping

### State of the Province

Primary Postgres inputs:

- `fact_service_pressure_daily`
- `fact_citizen_voice_daily`
- `fact_sentiment_daily`
- `fact_topic_share_daily`
- `documents`
- `signals`
- `service_incidents`
- `source_registry`

Used for:

- public concern volume
- top issue categories
- issue trend lines
- municipality pressure ranking
- heatmap
- alignment proxy between public concern and official attention

Support inputs:

- verified official source registry
- imported legacy community signals only as supporting evidence

### Leadership Sentiment

Primary Postgres inputs:

- `leader_mentions`
- `municipal_leader_mentions`
- `fact_leadership_sentiment_daily`
- `fact_municipal_leadership_sentiment_daily`
- `documents`
- `sentiment_mentions`
- `locations`

Used for:

- leader mention volume
- sentiment trend
- PR risk
- issue association
- evidence pack for a leader or office

Important limitation:

- provincial leadership coverage is still thin compared with the other dashboards
- municipal leadership coverage is also selective

This dashboard should be positioned as a political PR dashboard, not a comprehensive political intelligence archive.

### State of the Municipality & Wards

Primary Postgres inputs:

- `fact_service_pressure_daily`
- `fact_citizen_voice_daily`
- `fact_sentiment_daily`
- `documents`
- `signals`
- `service_incidents`
- `sentiment_mentions`
- `locations`

Support inputs:

- imported legacy community evidence from documents created via Firebase import path
- source registry

Used for:

- municipality issue pressure
- local issue matrix
- local sentiment and public voice
- ward registry and ward drilldown readiness

Important limitation:

- ward registry coverage is much stronger than ward-resolved issue evidence
- many municipalities currently have known wards in `locations` but zero ward-resolved incident or sentiment rows

Current ward registry examples from live data:

- Western Cape / Cape Town: `41` known wards
- Eastern Cape / Buffalo City: `7`
- Eastern Cape / Nelson Mandela Bay: `4`
- Mpumalanga / Steve Tshwete: `36`
- Northern Cape / Sol Plaatje: `11`

Current truth:

- the product can now show known wards more broadly
- ward-level issue/evidence metrics are still often `Registry Only`

### Social Media, News & Other Trends

Primary Postgres inputs:

- `citizen_voice_mentions`
- `fact_citizen_voice_daily`
- `fact_topic_share_daily`
- `documents`
- `signals`
- `sources`
- `source_registry`

Support inputs:

- verified social account whitelist
- verified media and civic source registry
- imported legacy community signals where clearly labeled

Used for:

- topic velocity
- share of voice
- source mix
- top signals
- narrative mood

This dashboard should stay framed as a governed signal monitor, not a full social firehose.

### Investor Profiling

Primary Postgres inputs:

- `infrastructure_projects`
- `project_funding_sources`
- `project_updates`
- `fact_infrastructure_projects_daily`
- `source_registry`
- `locations`

Used for:

- opportunity summary
- sector opportunity mix
- investor fit ranking
- opportunity detail

Important limitation:

- this is directional opportunity intelligence, not a confirmed investor pipeline

## 3. Province Coverage Relevant to Handover

Live municipality coverage now exposed through the governed directory layer:

- Eastern Cape: `5` municipalities
- Mpumalanga: `16`
- Northern Cape: `8`
- Western Cape: `11`

This is materially better than using fact tables alone because the directory now unions:

- fact tables
- `locations`
- `source_registry`

## 3A. Date Coverage

The governed analytics layer is already organized by date for the main operational and narrative dashboards.

Strong date-organized fact tables:

- `fact_service_pressure_daily`
- `fact_sentiment_daily`
- `fact_topic_share_daily`
- `fact_citizen_voice_daily`
- `fact_leadership_sentiment_daily`
- `fact_municipal_leadership_sentiment_daily`
- `fact_infrastructure_projects_daily`
- `fact_source_reliability_daily`
- `fact_water_reliability_daily`

What this means in practice:

- `State of the Province`
  - date slicing is meaningful now
- `State of the Municipality & Wards`
  - date slicing is meaningful at municipality level
  - weaker at ward level where evidence is still sparse
- `Social Media, News & Other Trends`
  - date slicing is meaningful now
- `Leadership Sentiment`
  - date slicing exists structurally, but the time series is only as strong as the thin leader mention volume
- `Investor Profiling`
  - project and funding recency exists
  - true investor-intent timing does not yet exist because the investor/company signal layer is still missing

Current truth:

- the platform is date-aware already
- date quality is strongest for province, municipality, and trends
- date quality is weaker for leadership and ward-level views because the underlying evidence density is lower

## 4. What To Stop Prioritizing

These should not receive further handover effort unless required for internal admin use:

- `src/app/province-comparison`
- `src/app/municipality-comparison`
- `src/app/analytics`
- comparison panels
- underlying “governed analytics” presentation surfaces

They can remain in the repo, but they are not client priority.

## 5. Build Rules For The Five Client Dashboards

1. Postgres fact tables and governed entity tables are the primary truth layer.
2. Firebase-derived material must be labeled as imported, legacy, or supporting evidence when used.
3. Local seed and mock files must never be presented as live intelligence.
4. Ward views must distinguish between:
   - known registry wards
   - evidence-backed wards
5. Investor views must remain directional and caveated.
6. Leadership must read as a political PR dashboard.
7. Any weak or misleading panel should be hidden, simplified, or relabeled rather than overstated.

## 6. Recommended Immediate Next Steps

1. Keep improving only the five required dashboards.
2. Use this inventory to tighten each dashboard’s source-of-truth rules.
3. Strengthen ward evidence ingestion next, because ward registry coverage is ahead of ward issue coverage.
4. Strengthen leadership mention ingestion next, because PR coverage is thinner than province and municipality intelligence.
5. Do not spend more time polishing comparison dashboards before client handover.
