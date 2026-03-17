# GIC Platform Firestore Schema

This document defines the 9 core collections used for the GIC Community Intelligence Platform.

## Collections

### 1. `communities`
- `id`: string (Document ID)
- `name`: string
- `municipality`: string
- `province`: string
- `lat`: number
- `lng`: number
- `population`: number
- `priorityScore`: number

### 2. `community_signals`
- `communityId`: string
- `timestamp`: timestamp
- `source`: string
- `content`: string
- `category`: 'Civil' | 'Roads' | 'Health' | 'Planning' | 'Structural'

### 3. `community_sentiment`
- `communityId`: string
- `score`: number (0-100)
- `trending`: 'up' | 'down' | 'stable'
- `topIssues`: string[]

### 4. `influencers`
- `id`: string
- `name`: string
- `role`: string
- `communityId`: string
- `influenceScore`: number
- `topics`: string[]

### 5. `infrastructure_predictions`
- `communityId`: string
- `category`: string
- `forecast6mo`: number
- `forecast12mo`: number
- `forecast36mo`: number

### 6. `community_priority_scores`
- `communityId`: string
- `score`: number
- `factors`: {
    "needIntensity": number,
    "growthSignals": number,
    "mediaAttention": number
  }

### 7. `project_sites`
- `id`: string
- `name`: string
- `communityId`: string
- `status`: string

### 8. `project_risk_forecasts`
- `projectId`: string
- `riskLevel`: 'low' | 'medium' | 'high'
- `mitigationActions`: string[]

### 9. `engagement_recommendations`
- `communityId`: string
- `action`: string
- `evidence`: string
- `confidence`: number
