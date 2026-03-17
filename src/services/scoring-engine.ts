import { db } from "../lib/firebase";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { GovernedMetric, METRIC_REGISTRY, calculateConfidence, getConfidenceRating } from "@/lib/reporting-schema";

export interface SOSResult extends GovernedMetric<number> {
    region: string;
    breakdown: {
        momentum: number;
        stability: number;
        alignment: number;
        risk: number;
    };
}

export const ScoringEngine = {
    /**
     * Calculates the Strategic Opportunity Score (SOS) for a specific region.
     * Weights: Tenders (30%), Leadership (20%), Budget (30%), Risk (-20%)
     * Governance: Confidence is derived from sample size relative to expected benchmarks.
     */
    calculateSOS: async (country: string, province: string, municipality?: string): Promise<SOSResult> => {
        const timestamp = new Date().toISOString();
        const baseQuery = `WHERE country=${country} AND province=${province}${municipality ? ` AND municipality=${municipality}` : ''}`;

        try {
            // 1. Fetch relevant signals from Firestore
            const filters = [
                where('country', '==', country),
                where('province', '==', province)
            ];
            if (municipality) filters.push(where('municipality', '==', municipality));

            const [tenders, leaders, planning, risks] = await Promise.all([
                getDocs(query(collection(db, 'tenders'), ...filters)),
                getDocs(query(collection(db, 'leaders'), ...filters)),
                getDocs(query(collection(db, 'planningBudgets'), ...filters)),
                getDocs(query(collection(db, 'riskSignals'), ...filters))
            ]);

            // 2. Momentum (Tenders) - Max 10.0
            const tenderCount = tenders.size;
            const momentumScore = Math.min(tenderCount * 2, 10);

            // 3. Stability (Leadership) - Max 10.0
            const leadershipScore = Math.min(leaders.size * 2.5, 10);

            // 4. Alignment (Planning/Budgets) - Max 10.0
            const alignmentScore = Math.min(planning.size * 3.3, 10);

            // 5. Risk - Max 10.0
            const riskSeverity = risks.size > 0 
                ? risks.docs.reduce((acc, doc) => acc + (doc.data().severity || 5), 0) / risks.size
                : 0;
            const riskScore = Math.min(riskSeverity * 2, 10);

            // 6. Confidence Calculation (Governed)
            // Benchmarks: 5 tenders, 4 leaders, 3 planning docs, 5 risk signals
            const confidence = calculateConfidence([
                { count: tenders.size, expected: 5 },
                { count: leaders.size, expected: 4 },
                { count: planning.size, expected: 3 },
                { count: risks.size, expected: 5 }
            ]);

            // 7. Final SOS Calculation
            const weightedPositive = (momentumScore * 0.3) + (leadershipScore * 0.2) + (alignmentScore * 0.3);
            const finalScore = Math.max(0, (weightedPositive * 10) - (riskScore * 2));

            return {
                id: METRIC_REGISTRY.SOS.id,
                label: METRIC_REGISTRY.SOS.label,
                region: municipality || province,
                value: confidence < 0.1 ? null : Number(finalScore.toFixed(1)),
                unit: '%',
                confidence,
                rating: getConfidenceRating(confidence),
                breakdown: {
                    momentum: momentumScore,
                    stability: leadershipScore,
                    alignment: alignmentScore,
                    risk: riskScore
                },
                trace: [
                    { table: 'tenders', query: baseQuery, sourceCount: tenders.size, timestamp },
                    { table: 'leaders', query: baseQuery, sourceCount: leaders.size, timestamp },
                    { table: 'planningBudgets', query: baseQuery, sourceCount: planning.size, timestamp },
                    { table: 'riskSignals', query: baseQuery, sourceCount: risks.size, timestamp }
                ]
            };
        } catch (error) {
            console.error("SOS Calculation Failed:", error);
            throw error;
        }
    },

    /**
     * Batch calculate SOS for multiple regions
     */
    getRegionalHeatmap: async (country: string, provinces: string[]): Promise<SOSResult[]> => {
        const results = await Promise.all(
            provinces.map(p => ScoringEngine.calculateSOS(country, p))
        );
        return results;
    }
};

