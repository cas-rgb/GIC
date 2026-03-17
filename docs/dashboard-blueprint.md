# Dashboard Blueprint

This product has five primary dashboards. They are not interchangeable. Each one answers a different executive question and must be backed by governed data.

## 1. State of the Province

Primary question:
What is happening in the province, where is pressure rising, how are citizens reacting, and what should leadership do next?

BI outputs:
- pressure score
- escalation score
- public sentiment score
- leadership exposure
- official evidence share
- recommendation priority list

Required data:
- `fact_service_pressure_daily`
- `fact_sentiment_daily`
- `fact_leadership_sentiment_daily`
- `fact_source_reliability_daily`
- `fact_water_reliability_daily`
- province and municipality evidence drilldowns

Decision use:
- provincial intervention prioritization
- executive briefing
- official versus narrative contradiction checking

## 2. Leadership Sentiment

Primary question:
Which leaders and offices are being associated with which issues, and is that perception improving or deteriorating?

BI outputs:
- leader sentiment score
- office exposure
- linked issue themes
- mention intensity
- evidence confidence

Required data:
- `fact_leadership_sentiment_daily`
- verified leader registry
- governed document mentions
- sentiment mentions with provenance

Decision use:
- reputational risk monitoring
- communication strategy
- issue-to-office accountability mapping

## 3. State of the Municipality & Wards

Primary question:
Which municipality or ward needs intervention first, and what is driving local pressure?

BI outputs:
- municipality pressure score
- local sentiment score
- municipal leadership exposure
- evidence balance
- ward coverage readiness
- local recommendations

Required data:
- municipality pressure facts
- municipality sentiment facts
- municipality leadership facts
- municipality evidence drilldown
- ward evidence coverage

Decision use:
- municipal action prioritization
- local escalation detection
- ward-readiness and field response planning

## 4. Social Media, News & Other Trends

Primary question:
What are citizens, media, and civic organisations saying before official systems fully register the pressure?

BI outputs:
- trend acceleration by issue
- complaint topic concentration
- contradiction flags
- citizen voice sentiment
- media and civic narrative spread

Required data:
- trusted media registry
- civic and research registry
- verified social accounts
- citizen voice query packs
- topic and escalation fact tables

Decision use:
- early warning
- issue emergence detection
- public mood interpretation
- contradiction spotting against official statements

## 5. Investor Profiling

Primary question:
Which infrastructure opportunities are investable, which funders fit them, and where are the highest-value gaps?

BI outputs:
- project pipeline count
- funding gap
- investor-fit ranking
- sector opportunity ranking
- province opportunity summary

Required data:
- `infrastructure_projects`
- `fact_infrastructure_projects_daily`
- project funding metadata
- Treasury / Municipal Money project pages

Decision use:
- infrastructure funding outreach
- project prioritization
- investor matching

## Product Rule

- official and structured sources drive KPI truth
- media, civic, and social sources drive evidence, sentiment, and early warning
- AI synthesizes; it does not invent facts
