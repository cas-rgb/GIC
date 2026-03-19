import { searchCommunityData, deepResearch } from "./tavily-service";
import { geminiFlash, extractJsonArray, extractJsonObject } from "./ai-service";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import {
  CommunityIssue,
  BudgetReference,
  ProvincialBudgetAllocation,
  LocationResolvedSignal,
} from "@/types/dashboard-one";

export class DashboardOnePipeline {
  static ALLOWED_TOPICS = [
    "Water Infrastructure",
    "Electricity Supply",
    "Roads and Transport",
    "Healthcare",
    "Housing",
    "Education",
    "Crime and Safety",
    "Waste Management",
    "Local Governance",
    "Economic Development",
    "Social Distress",
    "Public Transport",
    "Environmental Risk",
    "Provincial Infrastructure",
    "Other",
  ];

  /**
   * Step 1 & 4: Retrieve Real Signals using Tavily
   */
  static async retrieveProvincialSignals(province: string) {
    const queries = [
      `${province} service delivery complaints water electricity roads`,
      `${province} province protest water outage power outage municipality`,
      `${province} community concerns housing healthcare education crime`,
      `${province} provincial budget infrastructure water roads electricity`,
      `${province} residents frustrated service delivery news`,
      `${province} provincial budget speech infrastructure water roads housing`,
      `${province} treasury budget allocation healthcare education transport`,
    ];

    const allResults: any[] = [];
    for (const query of queries) {
      const results = await deepResearch(query);
      if (results?.results) {
        allResults.push(
          ...results.results.map((r: any) => ({ ...r, province, query })),
        );
      }
    }

    // Store raw results
    for (const res of allResults) {
      const id = `raw-${Buffer.from(res.url).toString("base64").substring(0, 20)}`;
      await setDoc(doc(collection(db, "public_signal_raw"), id), {
        ...res,
        source_type: res.url.includes("gov.za")
          ? "government_reference_raw"
          : "news_article",
        ingested_at: Timestamp.now(),
      });
    }

    return allResults;
  }

  /**
   * Step 2: AI Classification
   */
  static async classifySignal(signal: any) {
    const prompt = `
            Analyze this signal for the province of ${signal.province}:
            Title: ${signal.title}
            Content: ${signal.content}
            
            Extract structured data in JSON format:
            {
                "primary_topic": "One of: ${this.ALLOWED_TOPICS.join(", ")}",
                "secondary_topic": "string",
                "issue_category": "Civil|Roads|Health|Planning|Structural",
                "sentiment": "Positive|Neutral|Negative|Mixed",
                "urgency": "Low|Medium|High",
                "affected_service_area": "string",
                "citizen_concern_indicator": boolean,
                "government_priority_indicator": boolean,
                "budget_related_indicator": boolean,
                "confidence": 0-1,
                "municipality": "string or null",
                "district": "string or null"
            }
        `;

    const result = await geminiFlash.generateContent(prompt);
    const classification = extractJsonObject(result.response.text());

    if (classification) {
      const id = `issue-${Buffer.from(signal.url).toString("base64").substring(0, 20)}`;
      const issue: CommunityIssue = {
        id,
        ...classification,
        province: signal.province,
        tavily_result_id: signal.url,
        status: "active",
        country: "South Africa",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(doc(collection(db, "community_issue"), id), issue);

      // Step 3: Geography Resolution
      if (classification.municipality) {
        const geoId = `geo-${id}`;
        const geoSignal: LocationResolvedSignal = {
          id: geoId,
          signal_id: id,
          province: signal.province,
          municipality: classification.municipality,
          district: classification.district,
          ward: undefined,
          status: "active",
          country: "South Africa",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        await setDoc(
          doc(collection(db, "location_resolved_signal"), geoId),
          geoSignal,
        );
      }
    }
  }

  /**
   * Step 4: Extract Budget References
   */
  static async extractBudgetSignals(signal: any) {
    if (
      !signal.url.includes("budget") &&
      !signal.title.toLowerCase().includes("budget")
    )
      return;

    const prompt = `
            Extract budget information for ${signal.province} from this text:
            ${signal.content}
            
            Return a JSON array of budget allocations:
            [{
                "budget_topic": "string",
                "allocation_amount": number | null,
                "allocation_percentage": number | null,
                "fiscal_year": "string",
                "priority_level": "High|Medium|Low",
                "confidence": 0-1
            }]
        `;

    const result = await geminiFlash.generateContent(prompt);
    const allocations = extractJsonArray(result.response.text());

    for (const alloc of allocations) {
      const id =
        `budget-${signal.province}-${alloc.budget_topic}-${alloc.fiscal_year}`
          .replace(/\s+/g, "-")
          .toLowerCase();
      const budgetAlloc: ProvincialBudgetAllocation = {
        id,
        ...alloc,
        province: signal.province,
        status: "active",
        country: "South Africa",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(
        doc(collection(db, "provincial_budget_topic_allocation"), id),
        budgetAlloc,
      );
    }
  }

  static async runFullPipeline(province: string) {
    const signals = await this.retrieveProvincialSignals(province);
    for (const signal of signals) {
      await this.classifySignal(signal);
      await this.extractBudgetSignals(signal);
    }
  }
}
