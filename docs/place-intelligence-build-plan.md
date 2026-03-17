# Place Intelligence Build Plan

This plan converts the ward-to-province data acquisition roadmap into concrete repo tasks for `gic-app`.

## Goal

Build a historical and current place-intelligence layer that lets the platform answer:

- who lives in this ward / municipality / province
- how this place votes
- what its historical infrastructure problems are
- what its current issues are
- what infrastructure response is most justified

## Build Order

1. Canonical geography tables and import scripts
2. Election and councillor reference tables and import scripts
3. Demographic tables and import scripts
4. Budget and infrastructure-history tables and import scripts
5. Context enrichment tables and import scripts
6. Fact rebuild extensions and dashboard analytics wiring

## P0 Repo Tasks

### 1. Add canonical geography tables

Create migration:

- `016_place_reference.sql`

Add tables:

- `province_reference`
- `municipality_reference`
- `ward_reference`

Minimum fields:

- `province_reference`
  - `id`
  - `province_code`
  - `province_name`
  - `source_name`
  - `source_url`
  - `created_at`
- `municipality_reference`
  - `id`
  - `municipality_code`
  - `municipality_name`
  - `municipality_category`
  - `district_name`
  - `province_code`
  - `province_name`
  - `source_name`
  - `source_url`
  - `created_at`
- `ward_reference`
  - `id`
  - `ward_key`
  - `ward_number`
  - `ward_name`
  - `municipality_code`
  - `municipality_name`
  - `district_name`
  - `province_code`
  - `province_name`
  - `boundary_ref`
  - `source_name`
  - `source_url`
  - `created_at`

Add scripts:

- `scripts/import-province-reference.ts`
- `scripts/import-municipality-reference.ts`
- `scripts/import-ward-reference.ts`

Expected source folders:

- `data/reference/provinces/`
- `data/reference/municipalities/`
- `data/reference/wards/`

### 2. Add election history tables

Create migration:

- `017_election_history.sql`

Add tables:

- `province_election_results`
- `municipality_election_results`
- `ward_election_results`

Minimum fields:

- `election_year`
- `election_type`
- `geography_key`
- `party_name`
- `votes`
- `vote_share`
- `turnout`
- `winner_flag`
- `source_name`
- `source_url`
- `retrieved_at`

Add scripts:

- `scripts/import-iec-province-results.ts`
- `scripts/import-iec-municipality-results.ts`
- `scripts/import-iec-ward-results.ts`

Expected source folders:

- `data/reference/elections/`

### 3. Add ward councillor reference table

Create migration:

- `018_ward_councillors.sql`

Add table:

- `ward_councillors`

Minimum fields:

- `ward_key`
- `councillor_name`
- `party_name`
- `term_start`
- `term_end`
- `source_name`
- `source_url`
- `verification_tier`
- `retrieved_at`

Add scripts:

- `scripts/import-ward-councillors.ts`
- `scripts/merge-verified-ward-councillors.ts`

Expected source folders:

- `data/reference/councillors/`
- `data/enrichment/`

### 4. Add demographic baseline tables

Create migration:

- `019_demographics_yearly.sql`

Add tables:

- `province_demographics_yearly`
- `municipality_demographics_yearly`
- `ward_demographics_yearly`

Minimum fields:

- `year`
- `geography_key`
- `population_total`
- `households_total`
- `unemployment_rate`
- `income_band_summary`
- `service_access_water`
- `service_access_electricity`
- `service_access_sanitation`
- `language_profile`
- `settlement_profile`
- `economic_profile`
- `source_name`
- `source_url`
- `retrieved_at`

Add scripts:

- `scripts/import-province-demographics.ts`
- `scripts/import-municipality-demographics.ts`
- `scripts/import-ward-demographics.ts`

Expected source folders:

- `data/reference/demographics/`

### 5. Add budget allocation and infrastructure-history tables

Create migration:

- `020_historical_infrastructure.sql`

Add tables:

- `budget_allocations`
- `province_infrastructure_history`
- `municipality_infrastructure_history`
- `ward_infrastructure_history`
- `historical_issue_events`

Minimum fields:

- `geography_key`
- `issue_family`
- `service_domain`
- `event_date`
- `period_year`
- `severity`
- `summary_text`
- `budget_amount`
- `project_name`
- `project_status`
- `source_name`
- `source_url`
- `verification_tier`
- `retrieved_at`

Add scripts:

- `scripts/import-budget-allocations.ts`
- `scripts/import-infrastructure-history.ts`
- `scripts/import-historical-issue-events.ts`

Expected source folders:

- `data/reference/budgets/`
- `data/reference/history/`

## P1 Repo Tasks

### 6. Add place context enrichment table

Create migration:

- `021_place_context_reference.sql`

Add table:

- `place_context_reference`

Minimum fields:

- `geography_key`
- `context_type`
- `title`
- `summary_text`
- `tags`
- `source_name`
- `source_url`
- `verification_tier`
- `retrieved_at`

Add scripts:

- `scripts/import-place-context-reference.ts`
- `scripts/build-place-context-from-wikipedia.ts`

Expected source folders:

- `data/reference/context/`
- `data/enrichment/`

### 7. Add leader reference table

Create migration:

- `022_leader_reference.sql`

Add table:

- `leader_reference`

Minimum fields:

- `leader_key`
- `leader_name`
- `office_title`
- `province_name`
- `municipality_name`
- `party_name`
- `aliases`
- `source_name`
- `source_url`
- `verification_tier`
- `retrieved_at`

Add scripts:

- `scripts/import-leader-reference.ts`
- `scripts/sync-firebase-leadership-reference.ts`

### 8. Extend analytics queries to consume new reference/history layers

Update analytics modules:

- `src/lib/analytics/province-summary.ts`
- `src/lib/analytics/province-alignment-matrix.ts`
- `src/lib/analytics/municipality-summary.ts`
- `src/lib/analytics/ward-coverage.ts`
- `src/lib/analytics/leadership-sentiment.ts`
- `src/lib/analytics/investor-opportunities.ts`

Add supporting modules:

- `src/lib/analytics/place-profile.ts`
- `src/lib/analytics/place-election-history.ts`
- `src/lib/analytics/place-infrastructure-history.ts`
- `src/lib/analytics/place-context.ts`

## P2 Repo Tasks

### 9. Add dashboard panels for the new place-intelligence layer

Add components:

- `src/components/analytics/PlaceProfilePanel.tsx`
- `src/components/analytics/ElectionHistoryPanel.tsx`
- `src/components/analytics/InfrastructureHistoryPanel.tsx`
- `src/components/analytics/WardCivicProfilePanel.tsx`

Wire them into:

- `src/app/executive/province/page.tsx`
- `src/app/municipality-wards/page.tsx`
- `src/app/leadership-sentiment/page.tsx`
- `src/components/analytics/InvestorProfilingClient.tsx`

### 10. Extend AI briefing payloads

Update:

- `src/lib/intelligence/province-briefing.ts`
- `src/lib/intelligence/municipality-briefing.ts`
- `src/lib/intelligence/leadership-briefing.ts`
- `src/lib/intelligence/investor-briefing.ts`

New payload sections:

- place profile
- election context
- infrastructure history
- current-vs-historical change

## Source Priority

Use sources in this order:

1. official structured source
2. official document extraction
3. verified enrichment
4. contextual enrichment

Do not use contextual enrichment as the only truth layer for:

- elections
- councillors
- budgets
- ward boundaries

## Immediate First Implementation Slice

The fastest high-value sequence inside this repo is:

1. `016_place_reference.sql`
2. `017_election_history.sql`
3. `018_ward_councillors.sql`
4. `scripts/import-ward-reference.ts`
5. `scripts/import-iec-ward-results.ts`
6. `scripts/import-ward-councillors.ts`
7. `019_demographics_yearly.sql`
8. `scripts/import-municipality-demographics.ts`
9. `020_historical_infrastructure.sql`
10. `scripts/import-budget-allocations.ts`

## Acceptance Criteria

### Geography

- every ward has a stable `ward_key`
- every ward maps to a municipality and province
- dashboard filters can use the new reference tables directly

### Politics

- ward, municipality, and province election history can be queried by year
- councillor records can be shown with provenance

### Demographics

- each municipality has a demographic baseline
- each province has a demographic baseline
- ward-level demographics work where source coverage exists

### Infrastructure History

- province and municipality history can be queried by issue family and year
- ward history can be shown where evidence exists
- budget allocations are mapped into the same issue taxonomy as dashboards

### BI Impact

- `State of the Province` can compare current pressure to historical need and budget
- `State of the Municipality & Wards` can show ward identity, voting, history, and current issues
- `Leadership Sentiment` can be read in political context
- `Investor Profiling` can use place need and long-term infrastructure context
