# Web Enrichment Workflow

This workflow defines how to use web search and LLM extraction to fill place-intelligence gaps without polluting the governed BI layer.

## Core Rule

Use web and LLMs for `verified enrichment`, not uncontrolled imputation.

- SQL/Postgres remains the truth layer used by dashboards
- web search helps find candidate facts and source pages
- LLMs help extract and normalize structured fields
- nothing becomes dashboard truth without:
  - source URL
  - source name
  - retrieval date
  - verification tier
  - confidence

## What Web Search Is Good For

### Wards

- ward councillor name
- ward number and canonical label
- ward profile pages
- ward allocation projects
- ward by-election results
- ward suburb/area descriptions

### Municipalities

- municipality demographics and census summaries
- municipality election outcomes
- IDP / SDBIP / annual report references
- major infrastructure projects
- recurring service issues

### Provinces

- population and household baselines
- official priority and budget references
- provincial election outcomes
- socioeconomic context
- recurring infrastructure pressure themes

## Preferred Source Order

1. official municipal / provincial / IEC / Stats SA / Treasury pages
2. official PDFs and annual reports
3. Municipal Money / government datasets
4. Wikipedia for context and structured lead generation
5. media only if the fact is event-based and the source is credible

Wikipedia should not be the only source for:

- councillors
- budget allocations
- formal election winners
- ward boundaries

## Recommended Enrichment Targets

### P0

- `ward_councillors.csv`
- `ward_election_results.csv`
- `budget_allocations.csv`
- `municipality_demographics_yearly.csv`

### P1

- `ward_demographics_yearly.csv`
- `province_election_results.csv`
- `municipality_election_results.csv`
- `historical_issue_events.csv`

### P2

- richer place context
- cultural profiles
- weather/climate history
- crime and safety history

## Structured Extraction Pattern

For each web-sourced fact:

1. find source page
2. extract candidate fields
3. normalize names into repo geography keys
4. store in CSV/reference file
5. import into Postgres
6. verify via audit

## Example Field Sets

### Ward councillor

- province_name
- municipality_name
- ward_name
- councillor_name
- party_name
- office_title
- term_start
- term_end
- verification_tier
- confidence_score
- source_name
- source_url
- retrieved_at

### Ward election result

- province_name
- municipality_name
- ward_name
- election_year
- election_type
- party_name
- candidate_name
- votes
- vote_share
- turnout
- winner_flag
- source_name
- source_url

### Budget allocation

- geography_level
- province_name
- municipality_name
- ward_name
- issue_family
- service_domain
- period_year
- budget_amount
- project_name
- project_status
- summary_text
- source_name
- source_url
- verification_tier

## Where LLMs Help

LLMs are useful for:

- extracting structured fields from PDFs and web pages
- normalizing issue families into the governed taxonomy
- matching messy ward strings to canonical ward labels
- summarizing long municipal reports into importable candidate rows

LLMs are not allowed to:

- invent councillors
- guess election winners
- fabricate budget amounts
- fabricate ward demographics

## Practical Near-Term Approach

Use web search interactively to target high-value places first:

- Western Cape / City of Cape Town wards
- Eastern Cape / Buffalo City wards
- Mpumalanga / Steve Tshwete
- Northern Cape / Sol Plaatje

Then expand municipality by municipality.

## Acceptance Standard

A web-sourced fact is good enough for the platform when:

- the source is official or strongly credible
- the geography is unambiguous
- the record fits the governed schema
- the fact can be audited later
- the dashboard can present it without overclaiming certainty
