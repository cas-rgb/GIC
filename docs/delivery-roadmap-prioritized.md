# Prioritized Roadmap

This roadmap covers the next 50 delivery tasks for the governed dashboard platform.

Priority rules:
- `P0`: directly improves decision-grade data, dashboard trust, or critical product surfaces
- `P1`: materially improves depth, usability, or source breadth after P0
- `P2`: optimization, polish, and scale work after the core executive system is stable

## P0

1. Normalize legacy Firebase `community_signals` community names into governed province / municipality / ward mappings.
2. Create a shared legacy community alias registry instead of embedding mappings inside one import script.
3. Re-import Firebase `community_signals` using the stronger alias registry.
4. Add municipality and ward alias normalization for high-volume legacy locations like `Buffalo City`, `Nelson Mandela Bay`, `Nkangala District`, `Saldanha Bay`, and `Sol Plaatje`.
5. Distinguish official wards from neighborhood/community aliases in governed locations.
6. Build a municipality/ward mapping quality report for imported legacy data.
7. Surface imported legacy community signals directly in `State of the Municipality & Wards`.
8. Add a local hotspot table to `State of the Municipality & Wards` using municipality and ward/community signal density.
9. Tighten `State of the Province` so it leads with decision summary, hotspot municipalities, public pressure, and recommendations.
10. Tighten `State of the Municipality & Wards` so it leads with local summary, public pressure, and action priorities.
11. Tighten `Social Media, News & Other Trends` into a ranked hotspot, complaint-family, and evidence-first dashboard.
12. Add ranked municipality hotspot lists to the trends dashboard.
13. Add ranked complaint-family tables to the trends dashboard.
14. Add a province-by-province public-pressure ranking to the trends dashboard.
15. Improve recommendation issue-to-evidence alignment across province and municipality dashboards.
16. Add recommendation evidence summaries that explicitly separate official, media, civic, and public-voice sources.
17. Add recommendation confidence penalties when official share is low and narrative pressure is high.
18. Add municipality-level public-voice weighting into the decision-readiness strip.
19. Add province-level public-voice weighting into the decision-readiness strip.
20. Build a governed legacy-source import for `news_articles` if the Firebase collection is populated.

## P1

21. Build a governed legacy-source import for Firebase `riskSignals`.
22. Build a governed legacy-source import for Firebase `planningBudgets`.
23. Build a governed legacy-source import for Firebase `leaders`.
24. Build a governed legacy-source import for Firebase `strategicDatasets`.
25. Add explicit provenance badges for legacy-imported evidence versus live-ingested evidence.
26. Add freshness timestamps to the major public-voice and sentiment panels.
27. Create a local watchlist view for municipalities with high public pressure and low official share.
28. Create a province watchlist view for high public pressure and high escalation provinces.
29. Add ward/community alias coverage into the ward readiness panel.
30. Add a governed ward/community evidence panel beneath ward coverage.
31. Expand the citizen-voice query packs for secondary municipalities and district hubs.
32. Add more public-interest domains to Tavily collection where yields are non-duplicate.
33. Batch the Tavily collector so larger pack sets complete predictably without long-running monolithic runs.
34. Add import and collection run logs for Firebase and Tavily pipelines.
35. Create a data quality dashboard for unmapped community, municipality, and ward aliases.
36. Build a leadership page layout that looks and behaves like the rest of the BI surfaces.
37. Add leader hot-issue ranking tables to `Leadership Sentiment`.
38. Add a province-to-leader issue association matrix.
39. Improve `Investor Profiling` with more tabular ranking density and less narrative spacing.
40. Add project-to-municipality impact views inside `Investor Profiling`.

## P2

41. Add ward-level recommendation scaffolding where enough governed evidence exists.
42. Add drillthrough from municipality hotspots into ward/community evidence clusters.
43. Add export-ready province briefing PDFs or structured briefing payloads.
44. Add export-ready municipality briefing PDFs or structured briefing payloads.
45. Build a connector run history dashboard.
46. Build a failed-source remediation dashboard.
47. Add automated stale-source alerts.
48. Add scorecards for official evidence share improvement over time.
49. Add comparative benchmark views across provinces for investor readiness and public-pressure resilience.
50. Review and retire obsolete legacy Firebase readers once their governed replacements are fully live.

## Active Sequence

Current execution order:
1. `P0-1` Normalize legacy Firebase community names into governed province / municipality / ward mappings.
2. `P0-2` Create a shared legacy community alias registry.
3. `P0-3` Re-import Firebase `community_signals` using the stronger alias registry.
