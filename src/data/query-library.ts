export type QueryTheme =
  | "InfrastructureOpportunity"
  | "PlanningAndBudgets"
  | "ProcurementAndTenders"
  | "LeadershipAndDecisions"
  | "CommunityNeed"
  | "MiningAndIndustrial"
  | "RiskMonitoring"
  | "HealthInfrastructure"
  | "PropertyAndMaintenance"
  | "DonorFinance";

export interface GICQueryNode {
  query: string;
  theme: QueryTheme;
  priority: "high" | "medium" | "low";
  isRegional?: boolean;
}

export const GIC_QUERY_LIBRARY: Record<string, GICQueryNode[]> = {
  "South Africa": [
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query:
        "South Africa new road construction project announcement municipality",
    },
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query: "South Africa road rehabilitation project announcement province",
    },
    {
      theme: "InfrastructureOpportunity",
      priority: "medium",
      query:
        "South Africa public works infrastructure development announcement",
    },
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query:
        "South Africa clinic construction or hospital infrastructure upgrade",
    },
    {
      theme: "PlanningAndBudgets",
      priority: "high",
      query:
        "site:gov.za integrated development plan infrastructure project PDF municipality",
    },
    {
      theme: "PlanningAndBudgets",
      priority: "high",
      query: "site:gov.za municipal capital budget infrastructure roads PDF",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query: "site:etenders.gov.za civil engineering tender road construction",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query:
        "site:etenders.gov.za public works tender infrastructure maintenance",
    },
    {
      theme: "LeadershipAndDecisions",
      priority: "high",
      query: "South Africa new mayor appointed municipality infrastructure",
    },
    {
      theme: "CommunityNeed",
      priority: "high",
      query: "South Africa underdeveloped community road access problem",
    },
    {
      theme: "CommunityNeed",
      priority: "high",
      query: "South Africa informal settlement infrastructure backlog",
    },
    {
      theme: "CommunityNeed",
      priority: "high",
      query: "South Africa service delivery protest water sanitation roads",
    },
    {
      theme: "MiningAndIndustrial",
      priority: "high",
      query:
        "South Africa mine expansion announcement logistics infrastructure",
    },
    {
      theme: "MiningAndIndustrial",
      priority: "medium",
      query: "South Africa contract mining opportunity announcement",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "South Africa protest near road construction site",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "South Africa municipal payment delays contractors",
    },
    {
      theme: "HealthInfrastructure",
      priority: "high",
      query: "hospital infrastructure upgrade announcement South Africa",
    },
    {
      theme: "HealthInfrastructure",
      priority: "high",
      query: "clinic construction project announcement South Africa",
    },
  ],
  Namibia: [
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query: "Namibia road construction project announcement",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query: "site:cpbn.com.na open bid road construction",
    },
    {
      theme: "LeadershipAndDecisions",
      priority: "high",
      query: "Namibia minister of works and transport announced project",
    },
    {
      theme: "MiningAndIndustrial",
      priority: "high",
      query: "Namibia mine expansion project announcement",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "Namibia flood damaged roads project area",
    },
  ],
  Botswana: [
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query: "Botswana road construction project announcement",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query: "site:ppra.co.bw road construction tender",
    },
    {
      theme: "PlanningAndBudgets",
      priority: "high",
      query: "Botswana national budget roads health infrastructure",
    },
    {
      theme: "MiningAndIndustrial",
      priority: "high",
      query: "Botswana mine expansion infrastructure project",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "Botswana labour dispute mining site",
    },
  ],
  Eswatini: [
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query: "Eswatini road construction project announcement",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query: "Eswatini public works tender infrastructure",
    },
    {
      theme: "LeadershipAndDecisions",
      priority: "high",
      query: "Eswatini minister of public works announced project",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "Eswatini severe weather road damage",
    },
  ],
  Lesotho: [
    {
      theme: "InfrastructureOpportunity",
      priority: "high",
      query: "Lesotho road construction project announcement",
    },
    {
      theme: "DonorFinance",
      priority: "high",
      query: "Lesotho World Bank infrastructure project",
    },
    {
      theme: "ProcurementAndTenders",
      priority: "high",
      query: "Lesotho public works tender infrastructure",
    },
    {
      theme: "RiskMonitoring",
      priority: "high",
      query: "Lesotho landslide road damage project area",
    },
  ],
  Regional: [
    {
      theme: "InfrastructureOpportunity",
      priority: "medium",
      query: "Southern Africa transport corridor infrastructure project",
      isRegional: true,
    },
    {
      theme: "ProcurementAndTenders",
      priority: "medium",
      query: "Southern Africa regional civil engineering project",
      isRegional: true,
    },
    {
      theme: "MiningAndIndustrial",
      priority: "medium",
      query: "Southern Africa mining logistics infrastructure",
      isRegional: true,
    },
  ],
};
