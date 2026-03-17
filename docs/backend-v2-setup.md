# Backend V2 Setup

## Environment

Add the following to your local environment before running the v2 backend:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/gic_app
OPENAI_API_KEY=your_key_here
V2_NEWS_SOURCE_ID=00000000-0000-0000-0000-000000000001
V2_NEWS_SOURCE_NAME=Configured RSS Source
V2_NEWS_RSS_URL=https://example.com/rss.xml
V2_NEWS_SOURCE_ACTIVE=true
```

## Installed packages

- `pg`
- `openai`
- `xml2js`

## First migration

Run the SQL in:

- `migrations/001_backend_v2_core.sql`
- `migrations/002_backend_v2_facts.sql`

against your Postgres database.

Or run:

```bash
npm run migrate:v2
```

Then seed the configured source:

```bash
npm run seed:v2:sources
```

## First executable path

The processor entry point is:

- `src/lib/processing/run-document.ts`

The first analytics endpoint is:

- `GET /api/analytics/service-pressure?province=Gauteng&days=30`

The first smoke-check script is:

- `npm run smoke:v2`

It currently depends on:

- Postgres schema from `001_backend_v2_core.sql`
- a real document row in `documents`
- a valid `DATABASE_URL`

## What is implemented

- Postgres DB helper
- canonical processing contracts
- deterministic classifier, location resolver, signal extractor, incident extractor
- Postgres processing repository
- migration scaffold for core backend tables
- ingestion repository and source ingest orchestration
- job enqueue helpers and worker skeleton
- first fact rebuild module for service pressure
- migration runner script
- first analytics query module and API route
- source seeding script
- smoke-check script for row counts

## What still needs implementation

- real source ids and source seeding
- a full ingest job handler
- additional analytical fact tables
- embedding/chunk storage migration
- additional analytics APIs

## Suggested first run order

```bash
npm run migrate:v2
npm run seed:v2:sources
npm run ingest:news:v2
npm run worker:v2
npm run smoke:v2
```
