# Dashboard Taxonomy

Important rule:

- Do not mix the purpose of these dashboards.
- Each dashboard must answer a different executive question.
- Charts must only appear on the dashboard where they logically belong.
- Do not use random charts. Every chart must map to a business question.

## State of the Province

What this dashboard is:

- Provincial executive overview.
- Big-picture province view.

Story it must tell:

- What is happening across the province right now, what do citizens care about most, where are the biggest pressure points, and is government focus aligned with public need?

Main questions:

- What are the top issues people care about in this province?
- Are those issues increasing or decreasing?
- Which municipalities are under the most pressure?
- What is government budgeting for or prioritising?
- Are public concerns and government priorities aligned?

Belongs here:

- Top citizen concerns in the province
- Concern volume over time
- Service delivery issue categories
- Municipality-level concern distribution
- Provincial budget or priority areas
- Concern vs budget alignment
- Province-wide risk or pressure index
- Major emerging issue themes

Does not belong here:

- Detailed leader-by-leader sentiment
- Individual influencer analysis
- Detailed investor profiles
- Raw news feed lists as the main focus
- Ward-level operational detail unless summarised

Core BI visuals:

- Executive KPI cards
- Stacked horizontal bar chart for top issue categories
- Multi-line trend chart for issue volume over time by topic
- Ranked municipality bar chart
- Strategic alignment scatter plot for citizen concern percent vs government budget allocation percent
- Heatmap for issue intensity by municipality or district

## Leadership Sentiment

What this dashboard is:

- Public perception dashboard for provincial and municipal leadership.
- Reputation, trust, sentiment, and public narrative view.

Story it must tell:

- How are major leaders being perceived by the public, what themes are associated with them, and where are reputation risks or support signals emerging?

Main questions:

- What is sentiment toward the Premier?
- What is sentiment toward mayors and key leaders?
- Which leaders are associated with which issues?
- Is sentiment improving or deteriorating?
- What are the biggest public narratives about leadership?

Belongs here:

- Leader mention volume
- Sentiment scores by leader
- Positive / neutral / negative split
- Trend of sentiment over time
- Topic association by leader
- Reputation spike or drop events
- Comparison of leaders within a province
- Media tone vs social tone

Does not belong here:

- Detailed province budget charts
- Ward infrastructure heatmaps
- Investor matching
- Full raw article feed as the main view
- Detailed municipality issue distribution unless linked to a leader

Core BI visuals:

- KPI cards
- Sentiment trend line chart
- Grouped bar chart
- Lollipop chart or ranked bar chart
- Stacked bar chart for topic association by leader
- Event spike timeline
- Network graph only when implemented clearly and defensibly

## State of the Municipality & Wards

What this dashboard is:

- Local operational intelligence dashboard.
- On-the-ground municipality and ward service-delivery view.

Story it must tell:

- What is happening on the ground inside municipalities and wards, what do local communities care about most, and where are the most urgent service delivery pressure points?

Main questions:

- Which municipalities are struggling most?
- Which wards are showing the strongest issue signals?
- What issues dominate in each local area?
- Where is pressure increasing fastest?
- Which local areas need attention now?

Belongs here:

- Municipality issue volume
- Ward issue volume where available
- Top issue type per municipality
- Top issue type per ward
- Service delivery concern trends
- Infrastructure pain point mapping
- Local pressure score
- Issue escalation signals

Does not belong here:

- Detailed provincial budget strategy unless rolled up locally
- Overall province-wide leadership reputation
- Investor pipeline details
- National-level trend summaries
- Generic social media feed without geography

Core BI visuals:

- Ranked municipality bar chart
- Ranked ward bar chart only where real ward resolution exists
- Heatmap for issues by municipality and topic
- Choropleth map only where municipality or ward geography is trustworthy
- Stacked bar chart for issue distribution per municipality
- Trend lines for concern volume over time by municipality
- Bubble chart for issue volume vs urgency vs density or population
- Summary table with sparklines

## Social Media, News & Other Trends

What this dashboard is:

- Real-time public narrative and signal monitoring dashboard.
- Signals, momentum, visibility, and emerging narratives view.

Story it must tell:

- What are people, communities, media, and online conversations saying right now, which issues are rising fastest, and what narratives are spreading across the province or country?

Main questions:

- What topics are trending right now?
- Which issues are rising fastest?
- What are people saying online?
- Which stories are dominating the news?
- What narratives are spreading geographically?

Belongs here:

- Topic trend spikes
- Share of voice by topic
- News volume by theme
- Social conversation volume by theme
- Sentiment by topic
- Top rising narratives
- Source type breakdown
- Keyword or hashtag movement
- Location-linked signal density

Does not belong here:

- Detailed budget alignment analysis
- Full investor fit logic
- Detailed ward service tables unless sourced from trend signals
- Leader comparison as the main focus
- Static province summary without real-time signals

Core BI visuals:

- Topic velocity line chart
- Stacked area chart
- Treemap
- Source mix donut chart
- Sentiment bar chart by topic
- Structured topic cluster panel
- Geographic signal density map
- Top signals table

## Investor Profiling

What this dashboard is:

- Economic opportunity and investment matching dashboard.
- Place-based need to investor-fit view.

Story it must tell:

- What does this province or municipality need, what sectors are relevant, and which companies or investor types are most likely to align with those opportunities?

Main questions:

- What does the province or municipality need most?
- Which sectors are relevant to those needs?
- What companies or investor types may be a fit?
- What infrastructure or economic themes signal opportunity?
- Which areas are more investment-ready than others?

Belongs here:

- Infrastructure or development need categories
- Sector opportunity categories
- Investor or company signals
- Company-sector-location matching
- Strategic fit scores
- Province opportunity themes
- Port, logistics, energy, water, and housing opportunity mapping
- Investment-readiness summaries

Does not belong here:

- Leader sentiment timelines
- Public concern trend lines unless used as context
- Raw social feed
- Generic municipality issue ranking without investment relevance
- Province-wide budget dashboard without opportunity framing

Core BI visuals:

- KPI cards
- Sector opportunity bar chart
- Investor-to-sector matrix
- Scatter plot
- Bubble chart
- Ranked opportunity table
- Map only where opportunity zones are grounded in real infrastructure or economic signals

## Dashboard Definitions For Code Assistant

State of the Province:

- A province-wide executive overview showing top citizen concerns, concern trends, municipality pressure points, and alignment between public concern and government priorities or budget.

Leadership Sentiment:

- A dashboard tracking public and media sentiment toward the Premier, mayors, and key leaders, including sentiment trends, issue association, and reputation risk.

State of the Municipality & Wards:

- A local service delivery dashboard showing issue concentration, top concerns, and pressure points by municipality and ward.

Social Media, News & Other Trends:

- A real-time signal dashboard showing trending topics, sentiment, rising narratives, source mix, and geographic spread across social and news channels.

Investor Profiling:

- An economic opportunity dashboard matching province or municipality needs with likely sectors, companies, or investor profiles based on infrastructure and development signals.
