# Client Handover Note

## Scope

This handover build is focused on five dashboards only:

- State of the Province
- Leadership Sentiment
- State of the Municipality & Wards
- Social Media, News & Other Trends
- Investor Profiling

The following surfaces are intentionally not part of the main client story:

- Province Comparison
- Municipality Comparison
- Governed Analytics

## Filter Behavior

The main dashboards now use a shared filtering pattern where the data supports it:

- Province
- Municipality
- Ward
- Infrastructure service type
- Time window

Important notes:

- Ward filtering is only applied to evidence and public-voice layers where governed ward mappings already exist.
- Municipality and province KPI cards remain municipality-level or province-level unless the source data is truly ward-resolved.
- Investor Profiling now supports province and municipality filtering where Treasury project geography is available.

## Dashboard Intent

### State of the Province

Executive province-wide view of:

- top citizen concerns
- concern trend
- municipality pressure
- issue intensity
- public concern versus governed official attention

Important caveat:

- the alignment matrix uses governed official attention as a proxy for government focus, not literal budget allocation.

### Leadership Sentiment

Public-relations dashboard for political leaders showing:

- reputation health
- PR risk
- message pressure
- issue association
- evidence shaping the narrative

Important caveat:

- leadership coverage is thinner than the province-wide sentiment layer and only appears when governed sources explicitly mention named leaders.

### State of the Municipality & Wards

Local operational dashboard showing:

- local issue concentration
- top concerns
- pressure and escalation
- ward coverage and readiness
- supporting evidence and public voice

Important caveat:

- many municipalities now have known ward geography in the registry, but not all have ward-resolved issue evidence.
- `Registry Only` means the ward names are known but the current issue facts are not yet mapped to those wards.

### Social Media, News & Other Trends

Real-time narrative and signal monitor showing:

- topic velocity
- share of voice
- topic dominance
- source mix
- evidence behind the active narrative

Important caveat:

- this is a governed signal monitor, not a full social-media firehose.

### Investor Profiling

Directional opportunity dashboard showing:

- sector opportunity mix
- geography opportunity concentration
- ranked opportunities
- supporting project detail

Important caveat:

- this is directional opportunity intelligence for government engagement.
- it is not a confirmed investor commitment or pipeline tracker.

## Governed vs Directional

### Governed

These layers should be treated as the main truth layer:

- Postgres fact tables
- normalized documents, signals, incidents, sentiment, and project tables
- location registry
- source registry

### Directional

These layers support interpretation but should not be treated as stronger than the governed facts:

- imported legacy community signal support
- investor scoring and ranking logic
- AI-generated briefing text

## AI Briefings

AI summaries in this build are generated from structured filtered data, not from raw document dumps.

That means:

- SQL and governed fact tables determine what is true
- AI explains what it means
- caveats and confidence notes are mandatory where coverage is partial

## Known Caveats

- ward geography is broader than ward-resolved issue evidence
- leadership mention coverage is still selective in some provinces
- investor outputs are directional and confidence-tiered, not commitment-grade
- some municipality-level views remain stronger than ward-level views where local mapping is still sparse

## Recommended Demo Flow

1. Start with State of the Province
2. Drill into the highest-pressure municipality
3. Show ward readiness and local evidence
4. Move to Leadership Sentiment as the political PR layer
5. Use Trends to explain what narrative is rising
6. End with Investor Profiling as the directional opportunity view
