# Real Data Intake Plan

This is the governed intake order for turning the five dashboards into decision-grade surfaces.

## Current real layers already in the app

- official source registry in Postgres
- trusted media registry
- civic and research registry
- verified institutional social whitelist
- live RSS ingestion for news
- official connectors for SAnews, Municipal Money, CoGTA seeding, and DWS fallback
- province, municipality, sentiment, leadership, and recommendation fact layers

## Gaps that still need more real data

### Province and Municipality dashboards
- more structured CoGTA and DWS intake
- stronger municipality and ward mapping
- more official provincial and municipal notices

### Leadership Sentiment
- more named office aliases for provincial and municipal leaders
- more live document coverage mentioning leaders explicitly

### Social Media, News & Other Trends
- citizen voice query packs for public social search
- civic and community complaint channels
- better topic extraction and contradiction flags

### Investor Profiling
- deeper Treasury project detail ingestion
- project status refresh
- more funding-source metadata

## Source priority by class

1. official government and utility data
2. treasury and structured project pages
3. trusted media
4. civic / watchdog / research evidence
5. verified institutional social accounts
6. citizen voice social queries

## Citizen voice rule

Citizen voice must be ingested as:
- sentiment evidence
- complaint signals
- issue emergence

Citizen voice must not be ingested as:
- KPI truth
- official service completion
- financial fact

## Next collection passes

1. load more verified media and civic feeds into live ingestion
2. add province and municipality citizen voice query packs
3. materialize trend and topic fact tables from those query packs
4. connect the trend dashboard to those governed outputs
