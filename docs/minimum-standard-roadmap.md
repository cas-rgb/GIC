# Minimum Standard Roadmap

This roadmap defines the work required to bring the platform to the minimum acceptable standard for the five client dashboards:

1. State of the Province
2. Leadership Sentiment
3. State of the Municipality & Wards
4. Social Media, News & Other Trends
5. Investor Profiling

The rule is simple:

- each dashboard must answer a distinct executive question
- each chart must map to a business question
- no dashboard may overclaim precision that the data does not support

## Status Model

- `Open`
- `In Progress`
- `Blocked`
- `Done`

## Priority Model

- `P0`: required for minimum standard
- `P1`: required for strong handover quality
- `P2`: important polish or expansion after minimum standard is met

## Workstream A: Data And Truth Layer

### A1. Province budget and priorities normalization

- Priority: `P0`
- Status: `Open`
- Owner: `Data / Analytics Engineering`
- Dependencies:
  - access to governed budget/priorities sources
  - mapping into shared issue taxonomy
- Estimate: `3 to 5 days`
- Deliverables:
  - normalized province budget/priorities table
  - issue-category allocation output by province
  - documented mapping rules
- Acceptance criteria:
  - province dashboard can show budget or priority area allocation by issue
  - alignment matrix can reference budget/priorities truth, not only official attention proxy
  - caveats are explicit where budget coverage is partial

### A2. Leadership ingestion and entity resolution rebuild

- Priority: `P0`
- Status: `Open`
- Owner: `Data / NLP / Analytics Engineering`
- Dependencies:
  - leader alias registry
  - leader-source mention extraction
  - sentiment aggregation refresh
- Estimate: `4 to 6 days`
- Deliverables:
  - improved leader alias mapping
  - refreshed leadership fact tables
  - stronger provincial and municipal leader coverage
- Acceptance criteria:
  - leadership dashboard has enough data for meaningful rankings in target provinces
  - positive / neutral / negative split by leader is available
  - issue association by leader is available
  - leader trend and spike detection are possible

### A3. Ward evidence resolution rebuild

- Priority: `P0`
- Status: `Open`
- Owner: `Data / Geo / Analytics Engineering`
- Dependencies:
  - better location resolution
  - ward mapping rules
  - incident/sentiment/document joins
- Estimate: `4 to 7 days`
- Deliverables:
  - improved ward-coded incident and evidence coverage
  - ward evidence confidence layer
  - refreshed ward readiness states
- Acceptance criteria:
  - more municipalities move from `Registry Only` to `Partial` or `Operational`
  - ward ranking visuals can be shown where evidence is real
  - ward-level caveats remain truthful

### A4. Investor/company signal ingestion

- Priority: `P0`
- Status: `Open`
- Owner: `Data / Research / Analytics Engineering`
- Dependencies:
  - company or investor signal sources
  - sector normalization
  - location linkage
- Estimate: `5 to 8 days`
- Deliverables:
  - company/investor signal table
  - company-sector-location linking layer
  - investor-fit scoring inputs
- Acceptance criteria:
  - investor dashboard can show likely company or investor matches
  - investor-to-sector matrix is grounded in real evidence
  - outputs remain directional where certainty is low

## Workstream B: Filters And BI Completion

### B1. Shared filter contract completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / Analytics Engineering`
- Dependencies:
  - dashboard pages
  - analytics routes
- Estimate: `2 to 4 days`
- Deliverables:
  - shared filter support across all 5 dashboards for:
    - province
    - municipality
    - ward where truthful
    - service type
    - time window
    - confidence mode where relevant
- Acceptance criteria:
  - every dashboard respects its intended filters
  - URL state remains stable
  - empty states are clear when filters narrow too far

### B2. State of the Province BI completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / BI`
- Dependencies:
  - A1 for full budget truth
- Estimate: `2 to 3 days`
- Deliverables:
  - final issue category bar
  - final trend view
  - final municipality ranking
  - final heatmap
  - final alignment matrix
- Acceptance criteria:
  - dashboard answers all 5 main province questions
  - no leader or investor visuals leak into this page
  - alignment wording is truthful

### B3. Leadership Sentiment BI completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / BI`
- Dependencies:
  - A2
- Estimate: `3 to 4 days`
- Deliverables:
  - grouped positive / neutral / negative visual
  - sentiment trend line by leader
  - topic association visual
  - event spike timeline
  - media tone vs public tone split
- Acceptance criteria:
  - dashboard reads like a political PR dashboard
  - page answers all main leadership questions
  - evidence pack supports the ranking view

### B4. Municipality & wards BI completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / BI`
- Dependencies:
  - A3
- Estimate: `3 to 4 days`
- Deliverables:
  - municipality issue distribution view
  - ward ranking visual where evidence exists
  - municipality summary table with trend/confidence
  - local trend by municipality
- Acceptance criteria:
  - dashboard is clearly local and operational
  - ward visuals appear only where ward evidence is real
  - municipality KPIs do not pretend to be ward-resolved

### B5. Trends BI completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / BI`
- Dependencies:
  - sufficient geography attribution
- Estimate: `2 to 3 days`
- Deliverables:
  - stronger share-of-voice composition
  - topic dominance visual
  - source mix visual
  - geographic spread visual where truthful
  - top signals table hardening
- Acceptance criteria:
  - dashboard answers all current narrative questions
  - not confused with province or leadership dashboards
  - source mix and trends are easy to scan in first screen

### B6. Investor Profiling BI completion

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / BI`
- Dependencies:
  - A4
- Estimate: `3 to 5 days`
- Deliverables:
  - investor-to-sector matrix
  - strategic fit score display
  - investor/company table
  - need-vs-interest-vs-confidence scatter or bubble view
- Acceptance criteria:
  - dashboard answers matching questions, not only project opportunity questions
  - directionality and confidence are explicit
  - province and municipality filters work correctly

## Workstream C: AI, QA, And Delivery

### C1. Shared briefing payload completion

- Priority: `P1`
- Status: `In Progress`
- Owner: `Frontend / Intelligence`
- Dependencies:
  - stable analytics outputs per dashboard
- Estimate: `2 to 3 days`
- Deliverables:
  - all 5 dashboards emit the same grounded AI briefing structure
- Acceptance criteria:
  - every briefing is based on structured facts
  - every briefing includes confidence note and caveats

### C2. Data QA and coverage audit

- Priority: `P0`
- Status: `Open`
- Owner: `Analytics / QA`
- Dependencies:
  - live DB access
- Estimate: `2 days`
- Deliverables:
  - province coverage audit
  - municipality coverage audit
  - ward coverage audit
  - leadership density audit
  - investor signal audit
- Acceptance criteria:
  - known weak provinces/municipalities are documented
  - dashboards can explain thin coverage honestly

### C3. UX and narrative QA

- Priority: `P0`
- Status: `In Progress`
- Owner: `Frontend / Product QA`
- Dependencies:
  - dashboard pages
- Estimate: `2 to 3 days`
- Deliverables:
  - screenshot pass
  - first-screen clarity pass
  - empty-state pass
  - overclaim pass
- Acceptance criteria:
  - every dashboard tells the intended story in the first screen
  - no internal/admin language remains
  - no random or off-purpose visuals remain

### C4. Final handover pack

- Priority: `P1`
- Status: `In Progress`
- Owner: `Product / Delivery`
- Dependencies:
  - C2
  - C3
- Estimate: `1 day`
- Deliverables:
  - handover note
  - data caveats
  - demo sequence
  - filter explanation
- Acceptance criteria:
  - client can understand what is governed, partial, and directional

## Dashboard Readiness Targets

### State of the Province

- Minimum standard when:
  - top concerns are visible
  - trends are visible
  - municipalities are ranked
  - issue intensity is visible
  - priorities/budget alignment is grounded in real province allocation data or clearly caveated proxy data

### Leadership Sentiment

- Minimum standard when:
  - multiple leaders have real volume
  - sentiment split exists
  - topic association exists
  - trends exist
  - PR risk can be monitored over time

### State of the Municipality & Wards

- Minimum standard when:
  - municipality pressure is clear
  - ward coverage is explicit
  - some ward ranking is real where claimed
  - municipality trend and issue mix are visible

### Social Media, News & Other Trends

- Minimum standard when:
  - rising topics are clear
  - share of voice is clear
  - source mix is clear
  - top signals are visible
  - geographic spread exists where data supports it

### Investor Profiling

- Minimum standard when:
  - strongest opportunity sectors are visible
  - top geographies are visible
  - strategic fit is visible
  - likely investor/company matches are visible
  - confidence is explicit

## Immediate Repo-Only Execution Queue

These tasks can continue immediately without waiting on external data onboarding:

1. Finish remaining filter gaps on Leadership and Trends
2. Add the missing leadership grouped sentiment visual
3. Add clearer trends geography and source controls where data supports it
4. Harden first-screen storytelling on all five dashboards
5. Keep tightening caveats and confidence messaging

## External Dependency Queue

These tasks require more than repo-only UI work:

1. Province budget/priorities ingestion
2. Leadership mention expansion
3. Ward evidence rebuild
4. Investor/company matching ingestion

These should be tracked as delivery-critical blockers for reaching the full minimum standard.
