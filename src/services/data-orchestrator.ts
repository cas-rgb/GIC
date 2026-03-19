import { tavily } from "@tavily/core";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { DatasetEntry, StrategicDomain } from "@/types";
import {
  LeaderEntry,
  TenderNotice,
  InfrastructureOpportunity,
  RiskSignalEntry,
  PlanningBudget,
} from "@/types/database";
import { SA_REGIONAL_REGISTRY } from "@/data/regional-registry";
import { geminiFlash, extractJsonArray, extractJsonObject } from "./ai-service";
import { NormalizationUtility } from "@/utils/normalization-utility";

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

export class GlobalDataOrchestrator {
  /**
   * Orchestrates a full deep-dive for a specific municipality/region
   * Uses the Multi-Wave Thematic Library to capture 40+ datasets
   */
  static async performRegionalDeepDive(
    country: "South Africa" | "Namibia" | "Botswana" | "Eswatini" | "Lesotho",
    province: string,
    municipality: string,
    ward?: string,
  ) {
    const { GIC_QUERY_LIBRARY } = await import("@/data/query-library");
    const wardDisplay = ward
      ? ward.toLowerCase().startsWith("ward")
        ? ` (${ward})`
        : ` (Ward ${ward})`
      : "";
    console.log(
      `\n[GIC COMMAND CENTER] Starting 40-Dataset Orchestration for: ${municipality}${wardDisplay}, ${province}, ${country}`,
    );

    const results: DatasetEntry[] = [];
    const queries = GIC_QUERY_LIBRARY[country] || [];

    // 0. Wikipedia Baseline (Foundational Data)
    if (!ward) {
      // Only for municipality level
      const wikiData = await GlobalDataOrchestrator.fetchWikipediaBaseline(
        country,
        province,
        municipality,
      );
      results.push(...wikiData);
    }

    // 1. Execute Thematic Search Waves
    for (const queryNode of queries) {
      console.log(
        `  > Wave: ${queryNode.theme} | Priority: ${queryNode.priority}`,
      );

      // Inject context into query
      const contextSearch =
        `${queryNode.query} ${municipality} ${ward ? `${ward} ` : ""}${province}`.trim();

      try {
        const search = await tavilyClient.search(contextSearch, {
          searchDepth: "advanced",
          maxResults: 5,
        });

        if (search.results && search.results.length > 0) {
          results.push({
            id: crypto.randomUUID(),
            domain: queryNode.theme as StrategicDomain,
            datasetId: `Dataset_${queryNode.theme}_${Date.now()}`,
            municipality,
            ward,
            province,
            country,
            payload: search.results,
            source: "GIC Intelligence Intelligence (Advanced)",
            confidence: queryNode.priority === "high" ? 0.95 : 0.8,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          console.log(
            `    - Found ${search.results.length} intelligence signals.`,
          );
        }

        // INTERNAL THROTTLE: Prevent Tavily Rate Limit
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        if (error.status === 429) {
          console.warn(`    [RATE LIMIT] Tavily is throttled. Waiting 5s...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.error(`    [SEARCH ERROR] for "${queryNode.theme}":`, error);
        }
      }
    }

    // 2. Regional Themes (If applicable)
    if (GIC_QUERY_LIBRARY["Regional"]) {
      console.log(`  > Wave: Regional Integration`);
      for (const rNode of GIC_QUERY_LIBRARY["Regional"]) {
        try {
          const rSearch = await tavilyClient.search(
            `${rNode.query} ${country}`,
            { searchDepth: "advanced", maxResults: 3 },
          );
          results.push({
            id: crypto.randomUUID(),
            domain: rNode.theme as StrategicDomain,
            datasetId: `Regional_${rNode.theme}`,
            municipality,
            province,
            country,
            payload: rSearch.results,
            source: "GIC Regional Intelligence",
            confidence: 0.8,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (e) {}
      }
    }

    console.log(
      `\n[GIC COMMAND CENTER] Raw Intelligence Harvest Complete: ${results.length} total datasets captured.`,
    );

    // 3. NEW: Universal Signal Persistence (The Unstructured Pivot)
    console.log(`[GIC COMMAND CENTER] Persisting to Universal Signal Feed...`);
    await this.persistToUniversalFeed(
      results,
      country,
      province,
      municipality,
      ward,
    );

    // 4. Backward Compatibility: AI Transformation & Dataset Entries
    try {
      await this.transformAndPersist(
        results,
        country,
        province,
        municipality,
        ward,
      );
    } catch (error) {
      console.error(`[AI TRANSFORMATION FAILED] for ${municipality}:`, error);
    }

    await this.persistDatasetEntries(results);

    return results;
  }

  /**
   * Persists results to a single, unstructured 'universal_signals' collection.
   * This preserves 100% of the raw data for on-demand AI analysis.
   */
  private static async persistToUniversalFeed(
    entries: DatasetEntry[],
    country: string,
    province: string,
    municipality: string,
    ward?: string,
  ) {
    const collectionRef = collection(db, "universal_signals");

    // Group by theme to create a single signal document per theme per wave
    const themes = Array.from(new Set(entries.map((e) => e.domain)));

    for (const theme of themes) {
      const themeEntries = entries.filter((e) => e.domain === theme);
      const combinedPayload = themeEntries.flatMap((e) => e.payload);

      try {
        const signalDoc = this.sanitizeForFirestore({
          type: "signal_cluster",
          domain: theme,
          country,
          province,
          municipality,
          ward,
          raw_payload: combinedPayload,
          entry_count: combinedPayload.length,
          status: "active",
          harvest_timestamp: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        await addDoc(collectionRef, signalDoc);
        console.log(
          `  [UNIVERSAL] Persisted ${combinedPayload.length} signals for theme: ${theme}`,
        );
      } catch (error) {
        console.error(
          `  [UNIVERSAL ERROR] Failed to persist theme ${theme}:`,
          error,
        );
      }
    }
  }

  private static async fetchWikipediaBaseline(
    country: "South Africa" | "Namibia" | "Botswana" | "Eswatini" | "Lesotho",
    province: string,
    municipality: string,
  ): Promise<DatasetEntry[]> {
    console.log(`  > Wave: Wikipedia Socioeconomic Baseline...`);
    const query = `site:en.wikipedia.org ${municipality} Local Municipality ${province} ${country} demographics geography history economy`;

    try {
      const search = await tavilyClient.search(query, {
        searchDepth: "advanced",
        // @ts-ignore - Some versions of the SDK might have different property naming or type expectations
        includeRawContent: "text",
        maxResults: 1,
      });

      if (search.results && search.results.length > 0) {
        const result = search.results[0] as any;
        return [
          {
            id: crypto.randomUUID(),
            domain: "SocioeconomicIntel",
            datasetId: `WikiBaseline_${municipality}`,
            municipality,
            province,
            country,
            payload: result.rawContent || result.content,
            source: "Wikipedia (Scraped via Tavily)",
            confidence: 0.95,
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      }
    } catch (error) {
      console.error(`    [WIKI ERROR] for ${municipality}:`, error);
    }
    return [];
  }

  private static async transformAndPersist(
    rawEntries: DatasetEntry[],
    country: string,
    province: string,
    municipality: string,
    ward?: string,
  ) {
    console.log(
      `Transforming raw signals for ${municipality}${ward ? ` (Ward ${ward})` : ""}...`,
    );

    const combinedContent = rawEntries
      .map((e) => JSON.stringify(e.payload))
      .join("\n\n");

    const prompt = `
            STRATEGIC INSTITUTIONAL ANALYST BRIEF:
            Extract structured infrastructure intelligence for ${municipality}, ${ward ? `Ward ${ward}, ` : ""}${province}, ${country}.
            
            You are analyzing TAVILY SEARCH RESULTS. Your goal is to find ANY evidence of:
            1. LEADERSHIP: Names of Mayors, Provincial Premiers (or Gov Ministers in SADC), Municipal Managers, Infrastructure Heads.
            2. TENDERS: Procurement notices, RFPs, expressions of interest, or awards for 2024-2025.
            3. PLANNING: Integrated Development Plans (IDP), Budget allocations, project announcements (e.g. NDP 12 projects in Botswana).
            4. RISKS: Service delivery protests, power/water outages, bucket system usage, pit latrines, unpaved roads, illegal dumping, or mud schools.
            5. OPPORTUNITIES: Social infrastructure needs, clinic builds, electrification programs, or township economy grants.

             STRICT SCHEMA REQUIREMENT:
             Return a JSON object with keys: "leaders", "tenders", "opportunities", "risks", "planning", "signals".
             - Leaders: [{ name: string, role: string, contact?: string }]
             - Tenders: [{ id: string, title: string, department: string, status: string, closingDate: string, value?: string, category: 'Civil' | 'Roads' | 'Health' | 'Planning' | 'Structural', domain: string }]
             - Opportunities: [{ title: string, description: string, value: string, category: 'Civil' | 'Roads' | 'Health' | 'Planning' | 'Structural', domain: string }]
             - Risks: [{ type: string, severity: 'High'|'Medium'|'Low', description: string, location: string, domain: 'Environmental' | 'Social' | 'Political' | 'Commercial' }]
             - Planning: [{ title: string, budget: string, timeframe: string, status: string, domain: 'Commercial' | 'Infrastructure' }]
             - Signals: [{ text: string, sentiment: 'positive'|'neutral'|'negative', urgency: number, domain: string, source_type: string }]

             IMPORTANT: 
             1. "category" must be one of: 'Civil', 'Roads', 'Health', 'Planning', 'Structural'.
             2. "domain" must be one of: 'Political', 'Commercial', 'Cultural', 'Environmental', 'Social', 'Infrastructure'.
             3. "source_type" must be one of: 'News Media', 'Social Media', 'Wikipedia', 'GIC Internal'.

            If no data for a category, return empty array [].
            DO NOT add explanations. Return ONLY the JSON object.

            Search Data: ${combinedContent.substring(0, 120000)}
        `;

    const result = await geminiFlash.generateContent(prompt);
    const responseText = result.response.text();
    console.log(
      `[AI RESPONSE RAW] for ${municipality}:`,
      responseText.substring(0, 500),
    );

    const structuredData = extractJsonObject(responseText);
    console.log(
      `[STRUCTURED DATA] for ${municipality}:`,
      structuredData ? "SUCCESS" : "FAILED_PARSING",
    );
    if (structuredData) {
      console.log(`- Leaders: ${structuredData.leaders?.length || 0}`);
      console.log(`- Tenders: ${structuredData.tenders?.length || 0}`);
      console.log(`- Risks: ${structuredData.risks?.length || 0}`);

      // Batch save to structured collections
      if (structuredData.leaders)
        await this.saveToCollection(
          "leaders",
          structuredData.leaders,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.tenders)
        await this.saveToCollection(
          "tenders",
          structuredData.tenders,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.leaders)
        await this.saveToCollection(
          "leaders",
          structuredData.leaders,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.tenders)
        await this.saveToCollection(
          "tenders",
          structuredData.tenders,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.opportunities)
        await this.saveToCollection(
          "opportunities",
          structuredData.opportunities,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.risks)
        await this.saveToCollection(
          "riskSignals",
          structuredData.risks,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.planning)
        await this.saveToCollection(
          "planningBudgets",
          structuredData.planning,
          country,
          province,
          municipality,
          ward,
        );
      if (structuredData.signals)
        await this.saveToCollection(
          "riskSignals",
          structuredData.signals,
          country,
          province,
          municipality,
          ward,
        );
    }
  }

  private static async saveToCollection(
    colName: string,
    items: any[],
    country: string,
    province: string,
    municipality: string,
    ward?: string,
  ) {
    const collectionRef = collection(db, colName);
    for (const item of items) {
      try {
        // Normalize Geography and Sector
        const { province: normProv, municipality: normMuni } =
          NormalizationUtility.normalizeRegion(province, municipality);
        const normSector = item.category
          ? NormalizationUtility.normalizeSector(item.category)
          : undefined;
        const normDomain = item.domain
          ? NormalizationUtility.normalizeDomain(item.domain)
          : undefined;
        const normSource = item.source_type
          ? NormalizationUtility.normalizeSource(item.source_type)
          : undefined;

        const sanitized = this.sanitizeForFirestore({
          ...item,
          category: normSector || item.category,
          domain: normDomain || item.domain,
          sourceType: normSource || item.source_type || "GIC Intelligence",
          country,
          province: normProv,
          municipality: normMuni,
          ward,
          status: "active",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await addDoc(collectionRef, sanitized);
      } catch (error) {
        console.error(`[SAVE ERROR] in ${colName} for ${municipality}:`, error);
      }
    }
  }

  private static async persistDatasetEntries(entries: DatasetEntry[]) {
    const collectionRef = collection(db, "strategicDatasets");
    for (const entry of entries) {
      try {
        const sanitized = this.sanitizeForFirestore({
          ...entry,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await addDoc(collectionRef, sanitized);
      } catch (error) {
        console.error(
          `[SAVE ERROR] in strategicDatasets for ${entry.municipality}:`,
          error,
        );
      }
    }
  }

  private static sanitizeForFirestore(obj: any): any {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.sanitizeForFirestore(item))
        .filter((item) => item !== undefined);
    }

    const sanitized: any = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== undefined) {
        const sanitizedValue = this.sanitizeForFirestore(value);
        if (sanitizedValue !== undefined) {
          sanitized[key] = sanitizedValue;
        }
      }
    });
    return sanitized;
  }
}
