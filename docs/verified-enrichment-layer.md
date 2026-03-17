# Verified Enrichment Layer

This document defines the missing-data strategy for the platform.

The purpose is not to invent facts.

The purpose is to fill structured gaps using verified enrichment while protecting the governed BI layer from fabricated or low-confidence data.

## 1. Core Rule

Use this sequence:

1. governed Postgres facts first
2. verified official enrichment second
3. AI-derived candidate enrichment third
4. never promote a candidate into dashboard truth without source and confidence

This means:

- no fake ward councillors
- no fake budget allocations
- no fake ward metrics
- no fake investor matches

## 2. What This Layer Should Store

The verified enrichment layer should cover four missing-data families:

1. ward reference
2. leader reference
3. budget reference
4. company or investor signal reference

Examples:

- ward councillor name
- ward number to municipality mapping
- leader alias expansion
- issue-to-budget allocation references
- company-to-sector-to-location evidence

## 3. Confidence Tiers

Each enrichment row should carry one of these tiers:

### Tier 1: Governed

Use for:

- Postgres facts
- official source documents
- official municipal or provincial directories
- official treasury, project, or tender sources

This can be used directly in dashboards where appropriate.

### Tier 2: Verified Enrichment

Use for:

- official websites not yet normalized into the main fact layer
- municipal ward lists
- IEC or municipality councillor directories
- structured public registries

This can be used in dashboard metadata and supporting context if the source is stored and recent.

### Tier 3: AI-Derived Candidate

Use for:

- candidate ward mappings extracted from text
- candidate leader aliases
- candidate company-sector fits
- candidate budget-topic mappings

This must not be shown as truth until verified.

## 4. Recommended Table Shapes

These are the minimum table shapes recommended for implementation.

### ward_reference

Use for:

- ward metadata
- councillor identity
- municipality linkage

Suggested fields:

- `id`
- `province`
- `municipality`
- `ward`
- `ward_label`
- `councillor_name`
- `party`
- `office_title`
- `source_url`
- `source_name`
- `source_type`
- `source_date`
- `retrieved_at`
- `confidence_score`
- `verification_tier`
- `verified`
- `last_checked_at`

### leader_reference

Use for:

- leader aliases
- office normalization
- province or municipality linkage

Suggested fields:

- `id`
- `province`
- `municipality`
- `leader_name`
- `office`
- `aliases`
- `source_url`
- `source_name`
- `source_date`
- `retrieved_at`
- `confidence_score`
- `verification_tier`
- `verified`
- `last_checked_at`

### budget_reference

Use for:

- issue-to-budget or issue-to-priority mapping

Suggested fields:

- `id`
- `province`
- `fiscal_year`
- `issue_family`
- `program_name`
- `budget_amount`
- `budget_percentage`
- `priority_label`
- `source_document_id`
- `source_url`
- `source_name`
- `source_date`
- `retrieved_at`
- `confidence_score`
- `verification_tier`
- `verified`
- `last_checked_at`

### company_signal_reference

Use for:

- company, investor, tender, and commercial interest evidence

Suggested fields:

- `id`
- `company_name`
- `investor_type`
- `sector`
- `province`
- `municipality`
- `project_or_signal_name`
- `signal_type`
- `signal_strength`
- `source_document_id`
- `source_url`
- `source_name`
- `source_date`
- `retrieved_at`
- `confidence_score`
- `verification_tier`
- `verified`
- `last_checked_at`

## 5. Workflow

The recommended workflow is:

### Step 1: Detect gap

Examples:

- a ward is known but no councillor is stored
- a province has concern-vs-budget needs but no normalized budget layer
- a leader appears in documents but aliases are incomplete
- an opportunity exists but no company or tender signal is linked

### Step 2: Query verified sources

Priority order:

1. official municipal or provincial source
2. official registry or government source
3. structured public source
4. Wikipedia only as a discovery pointer, not as final truth where official source exists

### Step 3: AI-assisted extraction

AI can:

- extract ward number, councillor, party, office, date
- extract budget lines and issue mappings
- extract company, sector, municipality, and project relevance
- propose alias expansions

AI cannot:

- invent facts that were not found

### Step 4: Store candidate with provenance

Every candidate must store:

- source URL
- source date
- retrieval date
- confidence
- verification tier

### Step 5: Promote to verified enrichment

Promotion rule:

- promote only when the source is trustworthy and the extracted fields are coherent

### Step 6: Use in dashboards carefully

Allowed uses:

- ward metadata panels
- leader metadata normalization
- budget alignment support layer
- investor/company context tables

Disallowed uses:

- fabricated KPI math
- silent imputation into governed fact tables without provenance

## 6. Dashboard-Specific Uses

### State of the Province

Use verified enrichment for:

- issue-to-budget allocation support
- priority area labeling

### Leadership Sentiment

Use verified enrichment for:

- leader alias expansion
- office normalization

### State of the Municipality & Wards

Use verified enrichment for:

- ward councillor metadata
- ward naming cleanup
- ward-to-municipality normalization

### Social Media, News & Other Trends

Use verified enrichment sparingly:

- mainly for better geography and issue normalization

### Investor Profiling

Use verified enrichment for:

- company or investor context
- tender-to-sector-to-geography mapping

## 7. Minimum Acceptance Rules

An enrichment row is acceptable for product use only if:

- it has a source URL
- it has a retrieval date
- it has a confidence score
- it has a verification tier
- it does not conflict with a stronger official source

## 8. Immediate High-Value Enrichment Targets

1. ward councillor directories for target municipalities
2. province budget and priority references
3. leader alias and office expansion
4. tender-linked company and sector references

These are the highest-leverage enrichment targets because they close the current minimum-standard gaps in:

- province alignment
- leadership PR depth
- ward usability
- investor matching
