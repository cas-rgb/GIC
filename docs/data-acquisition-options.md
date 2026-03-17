# Data Acquisition Options

This document answers one question:

What are the practical options to get the data needed to fill the five required dashboards to minimum standard?

The five required dashboards are:

1. State of the Province
2. Leadership Sentiment
3. State of the Municipality & Wards
4. Social Media, News & Other Trends
5. Investor Profiling

The core conclusion is:

- the platform already has enough ingestion and processing infrastructure to improve the dashboards materially
- the missing work is concentrated in four truth layers:
  - province budget and priorities
  - leadership mention density
  - ward-resolved evidence
  - investor/company signal data

## 1. What We Can Already Use Now

The repo already has working or partly working paths for:

- official source ingestion
- RSS ingestion
- governed document processing
- citizen voice ingestion
- legacy Firebase community-signal import
- Municipal Money infrastructure project ingestion
- daily fact rebuilds
- leadership fact rebuilds

Existing scripts already present:

- `npm run ingest:news:v2`
- `npm run ingest:rss:v2`
- `npm run ingest:official:v2`
- `npm run ingest:cogta:v2`
- `npm run ingest:dws:v2`
- `npm run ingest:citizen-voice:v2`
- `npm run import:firestore:community-signals:v2`
- `npm run ingest:municipal-money:v2`
- `npm run normalize:projects:v2`
- `npm run rebuild:projects:v2`
- `npm run rebuild:sentiment:v2`
- `npm run rebuild:citizen-voice:v2`
- `npm run rebuild:leadership:v2`
- `npm run rebuild:municipal-leadership:v2`
- `npm run rebuild:water:v2`

This means the immediate question is not "how do we build ingestion from scratch?"

The immediate question is:

- which of the existing pipelines should be pushed harder
- which missing source classes must be added
- which old Firebase collections should be migrated instead of ignored

## 2. The Fastest Options By Dashboard

## State of the Province

### Data needed

- top citizen concerns
- concern volume over time
- municipality pressure
- province-wide risk/pressure
- government budgeting or priorities by issue
- concern vs budget alignment

### Already good enough

- public concern
- concern trends
- municipality pressure
- issue heatmap
- public vs official attention proxy

### Still missing

- a real province budget or strategic-priority truth layer by issue category

### Fastest options

Option A: revive and migrate existing Firebase budget collections

Candidate collections already referenced in the repo:

- `planningBudgets`
- `provincial_budget_topic_allocation`

What this would do:

- give the province dashboard a real issue-to-budget allocation layer faster than building a new extractor from nothing
- replace or supplement the current official-attention proxy

Why this is attractive:

- the repo already has budget-oriented legacy logic
- multiple files already reference budget extraction and budget allocation structures

Main risk:

- old Firebase budget data may be uneven, stale, or partially normalized

Option B: process governed budget and speech documents into Postgres `budgets`

The processing layer already supports budget extraction and persistence into Postgres:

- `src/lib/processing/document-classifier.ts`
- `src/lib/processing/processor.ts`
- `src/lib/processing/postgres-repository.ts`

What this would do:

- build a cleaner Postgres-native budget truth layer
- align better with the governed analytics architecture

Main risk:

- slower than reviving Firebase budget data
- needs document supply plus extractor quality

Recommended path for minimum standard:

- use Firebase budget collections as a short-term backfill
- normalize them into Postgres issue-category allocations
- then replace with Postgres-native budget extraction over time

## Leadership Sentiment

### Data needed

- leader mention volume
- positive / neutral / negative split
- issue association
- trend by leader
- event spikes
- PR risk depth

### Already good enough

- dashboard structure
- PR framing
- fact rebuild scripts
- leader alias registries

### Still missing

- enough leader mentions and fact rows

Current live weakness:

- `leader_mentions` is still very small
- `municipal_leader_mentions` is still very small

### Fastest options

Option A: improve leader alias coverage and reprocess existing documents

Existing assets:

- `src/lib/leadership/provincial-leaders.ts`
- `src/lib/leadership/municipal-leaders.ts`
- `scripts/rebuild-leadership-sentiment.ts`
- `scripts/rebuild-municipal-leadership-sentiment.ts`
- `scripts/process-queued-docs.ts`
- `scripts/reprocess-live-docs.ts`

What this would do:

- increase match rates without needing a brand-new source
- unlock more value from the documents already ingested

Why this is attractive:

- fastest route to better leadership density
- mostly alias and reprocessing work

Option B: expand official and media source coverage around premiers and mayors

Existing repo hints:

- official source ingestion exists
- provincial leader aliases already exist
- older OSINT scripts targeted premiers explicitly

What this would do:

- add more documents likely to mention named leaders directly
- improve PR trend credibility

Recommended path for minimum standard:

- first expand alias matching and rerun reprocessing and leadership rebuilds
- then add more leader-rich official and media sources

## State of the Municipality & Wards

### Data needed

- municipality issue volume
- top issue by municipality
- ward issue signals where real
- ward evidence
- local pressure trends
- ward readiness

### Already good enough

- municipality-level pressure and trends
- ward registry exposure
- ward coverage/readiness logic
- imported legacy community signal path

### Still missing

- broad ward-resolved evidence density

### Fastest options

Option A: remap existing legacy Firebase community signals more aggressively

Existing scripts:

- `scripts/import-firestore-community-signals.ts`
- `scripts/remap-legacy-community-locations.ts`
- `src/lib/legacy/community-aliases`

What this would do:

- improve ward and community resolution without waiting for new live ingestion
- move more municipalities from `Registry Only` to `Partial`

Why this is attractive:

- fastest ward gain from data already available

Option B: improve location resolution in document processing and citizen-voice ingestion

Existing assets:

- `src/lib/processing/location-resolver.ts`
- `scripts/process-queued-docs.ts`
- `scripts/reprocess-live-docs.ts`
- `scripts/ingest-citizen-voice-tavily.ts`

What this would do:

- raise municipality and ward hit rates for newly ingested documents
- improve future ward evidence naturally

Recommended path for minimum standard:

- first backfill ward/community mappings from legacy Firebase signals
- then strengthen location resolution and reprocess existing documents

## Social Media, News & Other Trends

### Data needed

- topic velocity
- share of voice
- source mix
- top signals
- sentiment by topic
- geographic spread

### Already good enough

- this is the most complete narrative data layer after province and municipality pressure

### Still missing

- stronger municipality-level and ward-level narrative attribution
- more source-specific depth if finer slicing is required

### Fastest options

Option A: keep running current citizen voice and registry source ingestion

Existing scripts:

- `npm run ingest:citizen-voice:v2`
- `npm run ingest:rss:v2`
- `npm run ingest:official:v2`
- `npm run ingest:news:v2`

What this would do:

- keep the trends dashboard fresh
- improve top-signal quality and source mix depth

Option B: expand query packs and source registry coverage

Existing assets:

- `data/source-registry/*`
- `data/source-registry/citizen_voice_query_packs.csv`
- `scripts/seed-v2-source-registry.ts`
- `scripts/seed-v2-citizen-voice.ts`

What this would do:

- improve narrative coverage by province and issue family without changing architecture

Recommended path for minimum standard:

- keep this workstream incremental
- it is not the biggest blocker right now

## Investor Profiling

### Data needed

- infrastructure need categories
- sector opportunity categories
- company/investor signals
- company-sector-location matching
- strategic fit

### Already good enough

- Municipal Money infrastructure projects
- normalized sector mix
- opportunity ranking
- project funding and updates

### Still missing

- real company or investor signal data
- investor-to-sector matching evidence

### Fastest options

Option A: use tenders as an intermediate market-signal layer

Existing support already exists in the repo:

- `tenders` appears in Firebase and in processing schemas
- the processing layer already supports normalized tenders

What this would do:

- provide a real market-activity proxy before true investor profiles exist
- improve opportunity readiness and commercial interest signals

Why this is attractive:

- faster than sourcing a completely new investor dataset
- still grounded in infrastructure activity

Option B: add company/investor watchlists and sector-location matching

Existing repo support:

- sector normalization exists
- location normalization exists
- source registry exists

What this would do:

- build the actual investor/company matching layer the dashboard still lacks

Main risk:

- this is the most net-new data workstream

Recommended path for minimum standard:

- first use tenders and known project/funding activity as a stronger commercial signal layer
- then add company/investor watchlists as a second step

## 3. Best Immediate Options Overall

If the goal is the fastest path to minimum standard, the best options are:

1. Province budget truth:
- migrate or normalize `planningBudgets` and `provincial_budget_topic_allocation` into Postgres-backed issue allocations

2. Leadership depth:
- expand aliases and rerun:
  - `reprocess-live-docs`
  - `rebuild:leadership:v2`
  - `rebuild:municipal-leadership:v2`

3. Ward depth:
- import/remap Firebase community signals again and strengthen location aliases

4. Investor depth:
- elevate `tenders` into the investor workflow as a commercial signal layer before building full investor/company profiling

These four moves are the highest leverage because they address the exact four weakest truth layers in the platform.

## 4. Practical Option Matrix

### Option 1: Fastest minimum-standard route

Use:

- Firebase budget collections
- Firebase community-signal backfill
- existing official/news/citizen-voice ingestion
- existing leadership rebuilds
- existing infrastructure projects
- tenders as investor proxy

Pros:

- fastest
- uses current repo assets
- least architectural disruption

Cons:

- some layers remain hybrid
- still needs clear caveats

Best for:

- getting the dashboards to minimum acceptable standard quickly

### Option 2: Cleanest governed-data route

Use:

- Postgres-only normalized budget extraction
- Postgres-only document/entity processing
- Postgres-only commercial signal model

Pros:

- cleaner long-term architecture
- strongest analytics integrity

Cons:

- slower
- requires more extractor and migration work

Best for:

- production hardening after minimum standard is reached

### Option 3: Hybrid route

Use:

- Firebase as backfill for budgets and community signals
- Postgres as the primary live analytics layer
- new source additions only where no existing data exists

Pros:

- best speed-to-quality balance
- aligns with the current product state

Cons:

- requires careful labeling of legacy versus governed support inputs

Best for:

- the current platform

## 5. Recommended Plan

The recommended plan is the hybrid route.

### Phase 1

Unlock what already exists:

- revive budget data from Firebase or existing budget docs
- rerun leadership matching with better aliases
- remap and reimport ward/community signals
- use tenders as investor-support signals

### Phase 2

Rebuild facts:

- leadership fact rebuild
- municipal leadership fact rebuild
- citizen voice rebuild
- project fact rebuild

### Phase 3

Tighten BI around the improved truth layers:

- province alignment becomes budget-aware
- leadership becomes PR-credible
- ward panels move beyond registry-only in more municipalities
- investor becomes opportunity-plus-market-signal, not only project scoring

## 6. What Not To Do

- do not rely on `mock-database.ts` for live client intelligence
- do not invent ward precision where location mapping is weak
- do not present official-attention proxy as literal budget truth once better budget data exists
- do not claim investor matching until company, tender, or commercial signal data is truly wired in

## 7. Suggested Immediate Commands

When the environment is ready, these are the highest-value execution paths already supported by the repo:

- `npm run import:firestore:community-signals:v2`
- `npm run ingest:citizen-voice:v2`
- `npm run ingest:official:v2`
- `npm run ingest:rss:v2`
- `npm run ingest:municipal-money:v2`
- `npm run normalize:projects:v2`
- `npm run rebuild:projects:v2`
- `npm run rebuild:leadership:v2`
- `npm run rebuild:municipal-leadership:v2`
- `npm run rebuild:citizen-voice:v2`

## 8. Final View

The shortest truthful path to filling the dashboards is not "get more random data."

It is:

- use the ingestion paths the repo already has
- recover the legacy budget and community layers that still matter
- improve leadership alias resolution
- improve ward location resolution
- promote tenders into the investor signal model

That is the most realistic way to bring the dashboards to minimum standard without rebuilding the whole platform.
