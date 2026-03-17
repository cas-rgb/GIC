// scripts/populate-gic-story.ts
import { loadEnv } from './load-env-cli';

// 1. Load environment variables IMMEDIATELY
loadEnv();

// 2. Now import dependencies that rely on process.env
// We use a helper to ensure imports happen after loadEnv
async function getDependencies() {
  const { db } = await import('../src/lib/firebase');
  const { collection, doc, setDoc, Timestamp } = await import('firebase/firestore');
  return { db, collection, doc, setDoc, Timestamp };
}

const STORY_DATA = {
  communityIssues: [
    {
      id: "story-issue-001",
      province: "Gauteng",
      municipality: "City of Johannesburg",
      primary_topic: "Water Infrastructure",
      issue_category: "Civil",
      sentiment: "Negative",
      urgency: "High",
      affected_service_area: "Subsurface Pipe Network",
      citizen_concern_indicator: true,
      government_priority_indicator: true,
      budget_related_indicator: true,
      confidence: 0.95,
      tavily_result_id: "https://www.dailymaverick.co.za/article/2026-joburg-water-crisis",
      source_title: "Joburg Water Crisis: Infrastructure Collapse in Northern Suburbs",
      status: "active",
      country: "South Africa"
    },
    {
      id: "story-issue-002",
      province: "Gauteng",
      municipality: "City of Tshwane",
      primary_topic: "Electricity Supply",
      issue_category: "Structural",
      sentiment: "Negative",
      urgency: "High",
      affected_service_area: "Grid Stability",
      citizen_concern_indicator: true,
      government_priority_indicator: true,
      budget_related_indicator: false,
      confidence: 0.82,
      tavily_result_id: "https://www.news24.com/tshwane-power-pylon-collapse",
      source_title: "Tshwane Power Surge: Industrial Sector Facing Rolling Blackouts",
      status: "active",
      country: "South Africa"
    },
    {
      id: "story-issue-003",
      province: "Western Cape",
      municipality: "City of Cape Town",
      primary_topic: "Roads and Transport",
      issue_category: "Roads",
      sentiment: "Mixed",
      urgency: "Medium",
      affected_service_area: "Arterial Maintenance",
      citizen_concern_indicator: true,
      government_priority_indicator: false,
      budget_related_indicator: true,
      confidence: 0.75,
      tavily_result_id: "https://www.iol.co.za/cape-town-pothole-backlog",
      source_title: "Cape Town Pothole Backlog: Residents Demand Faster Intervention",
      status: "active",
      country: "South Africa"
    }
  ],
  pressureCases: [
    {
      id: "story-pressure-001",
      sourceId: "news-001",
      province: "Gauteng",
      municipality: "City of Johannesburg",
      serviceDomain: "Water Infrastructure",
      pressureType: "Outage",
      issueCategory: "Infrastructure Collapse",
      sentiment: "Negative",
      urgency: "High",
      severity: "High",
      citizenPressureIndicator: true,
      serviceFailureIndicator: true,
      protestIndicator: true,
      responseIndicator: false,
      recurrenceIndicator: true,
      infrastructureIndicator: true,
      classificationConfidence: 0.98,
      publishedDate: "2026-03-10T10:00:00Z"
    },
    {
      id: "story-pressure-002",
      sourceId: "news-002",
      province: "Gauteng",
      municipality: "Ekurhuleni",
      serviceDomain: "Healthcare",
      pressureType: "Access Failure",
      issueCategory: "Clinic Waiting Times",
      sentiment: "Negative",
      urgency: "Medium",
      severity: "Medium",
      citizenPressureIndicator: true,
      serviceFailureIndicator: true,
      protestIndicator: false,
      responseIndicator: true,
      recurrenceIndicator: false,
      infrastructureIndicator: false,
      classificationConfidence: 0.85,
      publishedDate: "2026-03-12T08:30:00Z"
    },
    {
      id: "story-pressure-003",
      sourceId: "news-003",
      province: "Western Cape",
      municipality: "Drakenstein",
      serviceDomain: "Waste Management",
      pressureType: "Backlog",
      issueCategory: "Refuse Collection",
      sentiment: "Negative",
      urgency: "Medium",
      severity: "Low",
      citizenPressureIndicator: true,
      serviceFailureIndicator: true,
      protestIndicator: false,
      responseIndicator: false,
      recurrenceIndicator: true,
      infrastructureIndicator: false,
      classificationConfidence: 0.90,
      publishedDate: "2026-03-11T14:20:00Z"
    }
  ],
  budgetAllocations: [
    {
      id: "budget-gp-water",
      province: "Gauteng",
      budget_topic: "Water Infrastructure",
      allocation_amount: 4500000000,
      allocation_percentage: 12.5,
      fiscal_year: "2025/26",
      priority_level: "High",
      confidence: 1.0,
      status: "active"
    },
    {
      id: "budget-gp-electricity",
      province: "Gauteng",
      budget_topic: "Electricity Supply",
      allocation_amount: 3200000000,
      allocation_percentage: 8.9,
      fiscal_year: "2025/26",
      priority_level: "High",
      confidence: 1.0,
      status: "active"
    },
    {
      id: "budget-wc-roads",
      province: "Western Cape",
      budget_topic: "Roads and Transport",
      allocation_amount: 5800000000,
      allocation_percentage: 15.2,
      fiscal_year: "2025/26",
      priority_level: "High",
      confidence: 1.0,
      status: "active"
    }
  ]
};

async function main() {
  console.log("🚀 Starting GIC Story-Driven Seeding...");
  
  const { db, collection, doc, setDoc, Timestamp } = await getDependencies();

  // 1. Seed Community Issues (Dashboard 1)
  console.log("--- Seeding Community Issues ---");
  for (const issue of STORY_DATA.communityIssues) {
    await setDoc(doc(collection(db, "community_issue"), issue.id), {
      ...issue,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Seeded Issue: ${issue.source_title}`);
  }

  // 2. Seed Service Pressure Cases (Dashboard 2)
  console.log("\n--- Seeding Service Pressure Cases ---");
  for (const pc of STORY_DATA.pressureCases) {
    await setDoc(doc(collection(db, "service_pressure_case"), pc.id), {
      ...pc,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Seeded Pressure Case: ${pc.issueCategory} in ${pc.municipality}`);
  }

  // 3. Seed Budget Allocations (Dashboard 1 Alignment)
  console.log("\n--- Seeding Provincial Budget Allocations ---");
  for (const budget of STORY_DATA.budgetAllocations) {
    const key = `${budget.province}_${budget.budget_topic.replace(/\s+/g, '_')}`;
    await setDoc(doc(collection(db, "provincial_budget_allocation"), key), {
      ...budget,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Seeded Budget: ${budget.budget_topic} for ${budget.province}`);
  }

  console.log("\n✨ GIC Story Grounding Complete.");
  process.exit(0);
}

main().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
