const ISSUE_FAMILY_KEYWORDS: Array<{
  family: string;
  keywords: string[];
  topicAliases: string[];
}> = [
  {
    family: "water",
    keywords: [
      "water",
      "sanitation",
      "sewer",
      "sewage",
      "outage",
      "reservoir",
      "tanker",
    ],
    topicAliases: [
      "water",
      "water and sanitation",
      "water infrastructure",
      "sanitation",
    ],
  },
  {
    family: "roads",
    keywords: ["road", "roads", "pothole", "bridge", "transport", "corridor"],
    topicAliases: [
      "roads",
      "roads and transport",
      "road infrastructure",
      "transport",
    ],
  },
  {
    family: "electricity",
    keywords: [
      "electricity",
      "power",
      "load",
      "load shedding",
      "grid",
      "substation",
      "energy",
    ],
    topicAliases: [
      "electricity",
      "energy",
      "electricity infrastructure",
      "power",
    ],
  },
  {
    family: "governance",
    keywords: [
      "governance",
      "corruption",
      "council",
      "mayor",
      "leadership",
      "service delivery",
    ],
    topicAliases: [
      "municipal governance",
      "governance",
      "service delivery",
      "leadership",
    ],
  },
  {
    family: "refuse",
    keywords: ["refuse", "waste", "garbage", "dump", "collection"],
    topicAliases: ["refuse", "waste management", "solid waste"],
  },
  {
    family: "housing",
    keywords: [
      "housing",
      "settlement",
      "eviction",
      "homes",
      "informal settlement",
    ],
    topicAliases: ["housing", "human settlements", "settlements"],
  },
  {
    family: "healthcare",
    keywords: ["health", "clinic", "hospital", "ambulance", "healthcare"],
    topicAliases: ["healthcare", "health", "public health"],
  },
];

export const INFRASTRUCTURE_SERVICE_OPTIONS: Array<{
  value: string;
  label: string;
}> = [
  { value: "all", label: "All Services" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "roads", label: "Roads" },
  { value: "housing", label: "Housing" },
  { value: "healthcare", label: "Healthcare" },
  { value: "governance", label: "Civil & Governance" },
  { value: "refuse", label: "Waste & Refuse" },
];

export function normalizeIssueFamily(label?: string | null): string | null {
  if (!label) {
    return null;
  }

  const normalized = label.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  for (const issue of ISSUE_FAMILY_KEYWORDS) {
    if (
      issue.family === normalized ||
      issue.keywords.some((keyword) => normalized.includes(keyword)) ||
      issue.topicAliases.some((alias) => normalized === alias)
    ) {
      return issue.family;
    }
  }

  return normalized;
}

export function normalizeInfrastructureServiceFilter(
  label?: string | null,
): string | null {
  const normalized = normalizeIssueFamily(label);

  if (!normalized || normalized === "all") {
    return null;
  }

  return normalized;
}

export function getInfrastructureServiceLabel(label?: string | null): string {
  const normalized = normalizeInfrastructureServiceFilter(label);
  const matched = INFRASTRUCTURE_SERVICE_OPTIONS.find(
    (option) => option.value === (normalized ?? "all"),
  );

  return matched?.label ?? normalized ?? "All Services";
}

export function expandEvidenceTopics(label?: string | null): string[] {
  const family = normalizeIssueFamily(label);
  if (!family) {
    return [];
  }

  const matched = ISSUE_FAMILY_KEYWORDS.find(
    (issue) => issue.family === family,
  );
  if (!matched) {
    return [family];
  }

  return Array.from(new Set([family, ...matched.topicAliases]));
}
