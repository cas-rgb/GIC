import { BaseEntity, Sentiment, Category } from "./index";

export type IssueUrgency = "Low" | "Medium" | "High";

export interface CommunityIssue extends BaseEntity {
  primary_topic: string;
  secondary_topic?: string;
  issue_category: Category;
  sentiment: Sentiment | "Mixed";
  urgency: IssueUrgency;
  affected_service_area: string;
  citizen_concern_indicator: boolean;
  government_priority_indicator: boolean;
  budget_related_indicator: boolean;
  confidence: number;
  tavily_result_id: string; // Traceability link
  evidence_snippet: string; // Strategic context
  source_title: string;
}

export interface TopicMention extends BaseEntity {
  topic: string;
  mention_count: number;
  sentiment_score: number;
  source_refs: string[];
}

export interface SentimentObservation extends BaseEntity {
  topic: string;
  sentiment: Sentiment | "Mixed";
  observation_count: number;
}

export interface ProvincialPrioritySignal extends BaseEntity {
  priority_area: string;
  description: string;
  source_url: string;
}

export interface LocationResolvedSignal extends BaseEntity {
  signal_id: string;
  province: string;
  municipality: string | undefined;
  district: string | undefined;
  ward: string | undefined;
}

export interface BudgetReference extends BaseEntity {
  title: string;
  url: string;
  fiscal_year: string;
  department?: string;
  extracted_priorities: string[];
}

export interface ProvincialBudgetAllocation extends BaseEntity {
  budget_topic: string;
  allocation_amount: number | null;
  allocation_percentage: number | null;
  fiscal_year: string;
  priority_level: "High" | "Medium" | "Low";
  confidence: number;
}
