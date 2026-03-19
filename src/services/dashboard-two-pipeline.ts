// src/services/dashboard-two-pipeline.ts
import { searchCommunityData, deepResearch } from "./tavily-service";
import { geminiFlash, extractJsonObject } from "./ai-service";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import {
  ServicePressureCase,
  ServiceDomain,
  PressureType,
} from "@/types/dashboard2";

export class DashboardTwoPipeline {
  static SERVICE_DOMAINS: ServiceDomain[] = [
    "Water Infrastructure",
    "Electricity Supply",
    "Waste Management",
    "Sanitation",
    "Roads and Transport",
    "Public Transport",
    "Healthcare",
    "Housing and Settlements",
    "Local Governance",
    "Community Safety",
    "Provincial Infrastructure",
    "Other",
  ];

  static PRESSURE_TYPES: PressureType[] = [
    "Outage",
    "Delay",
    "Breakdown",
    "Backlog",
    "Complaint",
    "Protest",
    "Governance Failure",
    "Repair / Response",
    "Infrastructure Deterioration",
    "Access Failure",
    "Other",
  ];

  /**
   * Retrieves signals focused on operational friction and service pressure.
   */
  static async retrievePressureSignals(province: string) {
    const queries = [
      `${province} water crisis protest outage repair`,
      `${province} electricity load shedding substation failure community anger`,
      `${province} waste collection backlog sanitation health risk`,
      `${province} pothole damage road closure protest municipality`,
      `${province} clinic staff shortage medical supplies delay`,
      `${province} housing backlog occupation eviction protest`,
      `${province} municipality audit failure service delivery collapse news`,
      `${province} residents block roads service delivery news`,
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

    // Store raw operational signals
    for (const res of allResults) {
      const id = `ops-raw-${Buffer.from(res.url).toString("base64").substring(0, 20)}`;
      await setDoc(doc(collection(db, "service_pressure_raw"), id), {
        ...res,
        source_type: "operational_signal",
        ingested_at: Timestamp.now(),
      });
    }

    return allResults;
  }

  /**
   * AI Extraction: Maps a signal to a structured ServicePressureCase.
   */
  static async extractPressureCase(
    signal: any,
  ): Promise<ServicePressureCase | null> {
    const prompt = `
      Analyze this service delivery signal for the province of ${signal.province}:
      Title: ${signal.title}
      Content: ${signal.content}
      
      Extract a high-fidelity 'ServicePressureCase' JSON object:
      {
        "serviceDomain": "One of: ${this.SERVICE_DOMAINS.join(", ")}",
        "pressureType": "One of: ${this.PRESSURE_TYPES.join(", ")}",
        "issueCategory": "string or null (e.g., Substation Failure, Water Tankers, Refuse Collection)",
        "sentiment": "Positive|Neutral|Negative|Mixed",
        "urgency": "Low|Medium|High",
        "severity": "Low|Medium|High",
        "citizenPressureIndicator": boolean (Is this caused by citizen frustration/demand?),
        "serviceFailureIndicator": boolean (Is there an actual failure in infrastructure/service?),
        "protestIndicator": boolean (Is there a mention of a protest, march, or blockade?),
        "responseIndicator": boolean (Is there a mention of a repair, intervention, or official response?),
        "recurrenceIndicator": boolean (Is this a recurring issue?),
        "infrastructureIndicator": boolean (Is this a physical infrastructure problem?),
        "classificationConfidence": 0.0-1.0,
        "municipality": "string or null",
        "district": "string or null",
        "publishedDate": "ISO date string or null"
      }
    `;

    try {
      const result = await geminiFlash.generateContent(prompt);
      const data = extractJsonObject(result.response.text());

      if (data) {
        const id = `case-${Buffer.from(signal.url).toString("base64").substring(0, 20)}`;
        const pressureCase: ServicePressureCase = {
          id,
          sourceId: signal.url,
          province: signal.province,
          ...data,
          classificationConfidence: data.classificationConfidence || 0.8,
        };

        // Write to governed collection
        await setDoc(
          doc(collection(db, "service_pressure_case"), id),
          pressureCase,
        );
        return pressureCase;
      }
    } catch (error) {
      console.error("AI Pressure Extraction Failed:", error);
    }
    return null;
  }

  /**
   * Orchestrates the full pipeline for a province.
   */
  static async runOpsPipeline(province: string) {
    const signals = await this.retrievePressureSignals(province);
    const results = [];
    for (const signal of signals) {
      const pCase = await this.extractPressureCase(signal);
      if (pCase) results.push(pCase);
    }
    return results;
  }
}
