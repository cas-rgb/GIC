# GIC Backend V2

## Goal

Replace the current mixed Firestore/UI-driven analytics flow with a governed backend that separates:

1. ingestion
2. processing
3. analytics
4. retrieval and generation

## Core principles

- Raw documents are stored before AI touches them.
- Normalized records are validated before persistence.
- BI metrics come from analytical tables, not raw UI queries.
- AI generation uses governed facts plus cited retrieval only.

## Proposed layers

### 1. Ingestion

Responsibilities:

- fetch source content
- normalize text
- dedupe by content hash
- store canonical documents
- enqueue processing

### 2. Processing

Responsibilities:

- classify document type
- resolve geography
- extract normalized signals
- extract incidents
- validate outputs
- persist transactional records

Current scaffold:

- `src/lib/processing/types.ts`
- `src/lib/processing/contracts.ts`
- `src/lib/processing/validators.ts`
- `src/lib/processing/document-classifier.ts`
- `src/lib/processing/location-resolver.ts`
- `src/lib/processing/signal-extractor.ts`
- `src/lib/processing/incident-extractor.ts`
- `src/lib/processing/processor.ts`

### 3. Analytics

Target analytical tables:

- `fact_service_pressure_daily`
- `fact_signal_volume_daily`
- `fact_source_reliability_daily`
- `fact_budget_vs_pressure`

Dashboards must query analytical APIs backed by these facts.

### 4. Retrieval and generation

RAG should use:

- curated documents
- document chunks
- analytical metrics
- provenance metadata

Generation should only summarize grounded evidence. It should never write analytics facts directly.

## Near-term implementation order

1. add Postgres and migrations
2. implement a processing repository
3. add one document ingestion connector
4. build one daily fact table
5. replace one fake dashboard with one real analytics chart

## Immediate constraints

- `pg`, `pgvector`, OpenAI, and feed parsing packages are not yet installed in this repo.
- The scaffold added so far is dependency-light and safe to merge before wiring infrastructure.
