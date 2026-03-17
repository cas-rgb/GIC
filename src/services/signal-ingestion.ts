import { tavilyClient, searchOptions } from "@/lib/tavily";
import { CommunitySignal, EvidenceSource } from "@/types/database";
import { Category } from "@/types";
import { DataFetcher } from "@/lib/data-fetcher";
import { IntelligenceEngine } from "@/lib/intelligence-engine";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export interface NormalizedSignal {
    url: string;
    title: string;
    published_date?: string;
    source_name: string;
    source_type: 'local news' | 'regional news' | 'NGO' | 'municipal' | 'social';
    excerpt: string;
    matched_keywords: string[];
    detected_location: string;
    detected_topic: Category;
    sentiment?: string;
}

export type GICServiceLine = 
    | 'Water/Sewerage' 
    | 'Roads' 
    | 'Health' 
    | 'Town Planning' 
    | 'Structural';

export type TimeWindow = '7d' | '30d' | '90d';

export class SignalIngestionService {
    /**
     * Builds dynamic Tavily queries based on GIC templates.
     */
    static buildQueries(params: {
        community_name: string;
        municipality: string;
        province: string;
        service_line?: GICServiceLine;
        time_window: TimeWindow;
    }) {
        const { community_name, municipality, province, service_line, time_window } = params;
        const queries: string[] = [];

        // 1. Core query pack (Local news: infrastructure problems)
        queries.push(`("${community_name}" OR "${municipality}") AND (water OR sewerage OR sewage OR "burst pipe" OR "water outage" OR "no water" OR sanitation OR potholes OR roads OR "roadworks" OR clinic OR hospital OR "health facility" OR "town planning" OR housing OR "structural")`);
        
        // 2. Service delivery / municipal escalation
        queries.push(`("${community_name}" OR "${municipality}") AND ("service delivery" OR "service-delivery" OR "community protest" OR protest OR march OR shutdown OR "road block" OR unrest)`);

        // 3. Service line specific queries
        if (service_line === 'Water/Sewerage') {
            queries.push(`("${community_name}" OR "${municipality}") AND ("no water" OR "water outage" OR "water supply" OR "water cuts" OR "low water pressure" OR "water tanker")`);
            queries.push(`("${community_name}" OR "${municipality}") AND (sewerage OR sewage OR sanitation OR "sewage spill" OR "blocked drain" OR "wastewater")`);
        } else if (service_line === 'Roads') {
            queries.push(`("${community_name}" OR "${municipality}") AND (pothole OR potholes OR "road damage" OR "road collapse" OR sinkhole OR "bridge" OR "stormwater")`);
            queries.push(`("${community_name}" OR "${municipality}") AND ("roadworks" OR "road maintenance" OR resurfacing OR "traffic disruption" OR detour)`);
        } else if (service_line === 'Health') {
            queries.push(`("${community_name}" OR "${municipality}") AND (clinic OR hospital OR "health facility" OR "mobile clinic")`);
            queries.push(`("${community_name}" OR "${municipality}") AND ("clinic renovation" OR "hospital upgrade" OR "new clinic" OR "health infrastructure")`);
        } else if (service_line === 'Town Planning') {
            queries.push(`("${community_name}" OR "${municipality}") AND ("town planning" OR rezoning OR zoning OR "land use" OR "spatial planning")`);
            queries.push(`("${community_name}" OR "${municipality}") AND ("housing development" OR "new development" OR "mixed-use" OR "development application")`);
        } else if (service_line === 'Structural') {
            queries.push(`("${community_name}" OR "${municipality}") AND ("structural" OR "structural damage" OR "building collapse" OR "unsafe building")`);
            queries.push(`("${community_name}" OR "${municipality}") AND ("community hall" OR "school building" OR "public building" OR "facility upgrade")`);
        }

        return queries;
    }

    /**
     * Maps GIC Service Line to Category.
     */
    static mapServiceLineToCategory(serviceLine?: GICServiceLine): Category {
        switch (serviceLine) {
            case 'Water/Sewerage': return 'Civil';
            case 'Roads': return 'Roads';
            case 'Health': return 'Health';
            case 'Town Planning': return 'Planning';
            case 'Structural': return 'Structural';
            default: return 'Civil'; // Default to Civil
        }
    }

    /**
     * Executes ingestion for a specific context and stores in Firestore.
     */
    static async ingestSignals(params: {
        community_id?: string;
        community_name: string;
        municipality: string;
        province: string;
        service_line?: GICServiceLine;
        time_window: TimeWindow;
    }) {
        const queries = this.buildQueries(params);
        const signals: CommunitySignal[] = [];
        const evidenceItems: EvidenceSource[] = [];
        const category = this.mapServiceLineToCategory(params.service_line);

        for (const query of queries) {
            try {
                const searchResponse = await tavilyClient.search(query, {
                    ...searchOptions,
                    // Advanced search depth provides more comprehensive content
                    searchDepth: "advanced"
                });

                if (searchResponse.results) {
                    for (const res of searchResponse.results) {
                        const id = `real-sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        const sourceType = DataFetcher.classifySource(res.url);
                        const layers = DataFetcher.detectLayers(res.title + res.content);

                        const signal: CommunitySignal = {
                            id,
                            communityId: params.community_id || 'national-hub',
                            type: 'media',
                            text: res.title,
                            layers: layers,
                            sentiment: DataFetcher.detectSentiment(res.content),
                            emotion: DataFetcher.detectEmotion(res.content),
                            urgency: DataFetcher.calculateUrgency(layers),
                            momentum: 0.5,
                            category: category,
                            source: new URL(res.url).hostname,
                            sourceType: sourceType as any,
                            sourceUrl: res.url,
                            evidenceId: `real-ev-${id}`,
                            country: 'South Africa',
                            province: params.province,
                            municipality: params.municipality,
                            status: 'active',
                            reliabilityScore: (IntelligenceEngine.CREDIBILITY_WEIGHTS as any)[sourceType] || 0.5,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        const evidence: EvidenceSource = {
                            id: `real-ev-${id}`,
                            signalId: id,
                            title: res.title,
                            snippet: res.content.substring(0, 500) + "...",
                            originalSourceUrl: res.url,
                            verificationStatus: 'verified',
                            capturedBy: 'Tavily-GIC-Ingest',
                            country: 'South Africa',
                            province: params.province,
                            municipality: params.municipality,
                            metadata: {
                                sourceName: new URL(res.url).hostname,
                                dateMentioned: new Date().toISOString(),
                                score: res.score,
                                matched_keywords: [] // Can be refined further
                            },
                            status: 'active',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };

                        signals.push(signal);
                        evidenceItems.push(evidence);
                    }
                }
            } catch (error) {
                console.error(`Ingestion Query Failed: ${query}`, error);
            }
        }

        // Batch save to Firestore
        try {
            const signalsRef = collection(db, "riskSignals");
            const evidenceRef = collection(db, "evidenceSources");

            // For now, let's just return them and handle saving in the server action 
            // to keep the service purely logic-based if needed, 
            // but the requirement says "pull this data into the database".
            
            for (const sig of signals) {
                await setDoc(doc(signalsRef, sig.id), sig);
            }
            for (const ev of evidenceItems) {
                await setDoc(doc(evidenceRef, ev.id), ev);
            }

            return { 
                success: true, 
                signalCount: signals.length, 
                evidenceCount: evidenceItems.length,
                signals,
                evidence: evidenceItems
            };
        } catch (error) {
            console.error("Firestore persistence failed:", error);
            throw error;
        }
    }
}
