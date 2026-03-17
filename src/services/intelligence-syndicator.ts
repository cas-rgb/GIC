import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { geminiPro, geminiEmbed, extractJsonObject } from "./ai-service";
import { CommunitySignal } from "@/types/database";

export class CommunityIntelligenceSyndicator {
    /**
     * Main entry point to syndicate intelligence across all ingested regions.
     */
    static async syndicateAll() {
        console.log("🚀 Starting Global Intelligence Syndication...");
        
        // 1. Get all unique municipalities/areas from signals
        const signalsRef = collection(db, "riskSignals");
        const snapshot = await getDocs(signalsRef);
        const signals = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        const areas = Array.from(new Set(signals.map(s => s.municipality || s.province || "Unknown")));
        console.log(`🔍 Found ${signals.length} signals across ${areas.length} areas.`);

        for (const area of areas) {
            await this.syndicateArea(area, signals.filter(s => (s.municipality || s.province) === area));
        }
    }

    /**
     * Processes signals for a specific area into a high-order Community Intelligence document.
     */
    static async syndicateArea(area: string, areaSignals: any[]) {
        if (areaSignals.length === 0) return;
        
        console.log(`📦 Syndicating Area: ${area} (${areaSignals.length} signals)`);

        try {
            // 1. Prioritize top signals by urgency to ensure focus
            const prioritizedSignals = [...areaSignals]
                .sort((a, b) => b.urgency - a.urgency)
                .slice(0, 50);

            // 2. Generate Narrative via Gemini 1.5 Pro
            const signalText = prioritizedSignals.map(s => `[${s.category}] ${s.text} (Urgency: ${s.urgency})`).join("\n");
            
            const prompt = `
                As a GIC (Gauteng Infrastructure Company) Lead Strategist, synthesize the following raw signals into a high-order "Community Intelligence" profile for ${area}.
                
                RAW SIGNALS:
                ${signalText}

                TRANSFORMATION GOALS:
                1. Identify the "Critical Mandate Node" (The most pressing infrastructure sector).
                2. Calculate an "Aggregate Stress Index" (1-100).
                3. Generate a "Sovereign Executive Summary" (Institutional narrative).
                4. List "Stakeholder Vectors" (Who is affected).
                5. Predict "Infrastructure Trajectory" (Stable, Declining, or Recovering).

                OUTPUT FORMAT (JSON ONLY):
                {
                    "name": "${area}",
                    "criticalSector": "Civil|Roads|Health|Planning|Structural",
                    "stressIndex": number,
                    "summary": "...",
                    "trajectory": "Stable|Declining|Recovering",
                    "priorityLevel": number,
                    "keyIssues": ["issue 1", "issue 2"],
                    "impactAnalysis": "..."
                }
            `;

            const result = await geminiPro.generateContent(prompt);
            const intel = extractJsonObject(result.response.text());

            if (!intel) throw new Error("Failed to generate intelligence object");

            // 2. Map to Firestore 'communities' collection
            const communityId = area.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const communityRef = doc(db, "communities", communityId);
            
            await setDoc(communityRef, {
                ...intel,
                country: areaSignals[0]?.country || 'South Africa',
                province: areaSignals[0]?.province || 'Gauteng',
                municipality: areaSignals[0]?.municipality || area,
                lastUpdated: new Date().toISOString(),
                signalCount: areaSignals.length,
                lat: areaSignals[0].lat || -26.2041, // Fallback to Johannesburg
                lng: areaSignals[0].lng || 28.0473,
                activeSignals: areaSignals.slice(0, 10).map(s => s.id) // Reference top 10 signals
            }, { merge: true });

            console.log(`✅ Syndicated ${area} -> ${communityId}`);
        } catch (error) {
            console.error(`❌ Failed to syndicate ${area}:`, error);
        }
    }
}
