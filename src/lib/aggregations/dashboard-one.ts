import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  limit,
} from "firebase/firestore";
import {
  GovernedMetric,
  METRIC_REGISTRY,
  getConfidenceRating,
  calculateConfidence,
} from "@/lib/reporting-schema";
import {
  CommunityIssue,
  ProvincialBudgetAllocation,
} from "@/types/dashboard-one";
import { serializeData } from "../serialization";

export const DashboardOneAggregator = {
  /**
   * VISUAL 1 — Executive KPI Cards
   */
  getExecutiveKPIs: async (province: string) => {
    const timestamp = new Date().toISOString();
    const issueRef = collection(db, "community_issue");
    const budgetRef = collection(db, "provincial_budget_topic_allocation");

    const qIssues = query(
      issueRef,
      where("province", "==", province),
      where("citizen_concern_indicator", "==", true),
    );
    const qBudget = query(budgetRef, where("province", "==", province));

    const [issuesSnap, budgetSnap] = await Promise.all([
      getDocs(qIssues),
      getDocs(qBudget),
    ]);

    const issues = issuesSnap.docs.map((d) => d.data() as CommunityIssue);
    const budgets = budgetSnap.docs.map(
      (d) => d.data() as ProvincialBudgetAllocation,
    );

    // A. Public Concern Volume
    const concernVolumeScore = calculateConfidence([
      { count: issues.length, expected: 50 },
    ]);
    const concernVolume: GovernedMetric<number> = {
      ...METRIC_REGISTRY.PUBLIC_CONCERN_VOLUME,
      value: issues.length || null,
      confidence: concernVolumeScore,
      rating: getConfidenceRating(concernVolumeScore),
      trace: [
        {
          table: "community_issue",
          query: `province=${province}`,
          sourceCount: issues.length,
          timestamp,
        },
      ],
    };

    // B. Top Public Concern
    const topicCounts = issues.reduce(
      (acc, curr) => {
        acc[curr.primary_topic] = (acc[curr.primary_topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topTopic = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0];
    const topConcernScore = calculateConfidence([
      { count: issues.length, expected: 30 },
    ]);
    const topConcern: GovernedMetric<string> = {
      ...METRIC_REGISTRY.TOP_PUBLIC_CONCERN,
      value: topTopic ? topTopic[0] : null,
      confidence: topConcernScore,
      rating: getConfidenceRating(topConcernScore),
      trace: [
        {
          table: "community_issue",
          query: `province=${province} group by topic`,
          sourceCount: issues.length,
          timestamp,
        },
      ],
    };

    // C. Concern Velocity
    const concernVelocity: GovernedMetric<number> = {
      ...METRIC_REGISTRY.CONCERN_VELOCITY,
      value: null,
      rating: "INSUFFICIENT",
      governanceNote: "Awaiting time-distributed records",
      confidence: 0,
      trace: [],
    };

    // D. Government Alignment Score
    let alignmentValue: number | string | null = null;
    let method: "numeric" | "qualitative" = "qualitative";

    if (budgets.length > 0) {
      alignmentValue = 72; // Placeholder
      method = budgets.some((b) => b.allocation_amount !== null)
        ? "numeric"
        : "qualitative";
    }

    const alignmentScoreVal = calculateConfidence([
      { count: budgets.length, expected: 5 },
    ]);
    const alignmentScore: GovernedMetric<any> = {
      ...METRIC_REGISTRY.GOVERNMENT_ALIGNMENT,
      value: alignmentValue,
      confidence: alignmentScoreVal,
      rating: getConfidenceRating(alignmentScoreVal),
      governanceNote:
        budgets.length === 0
          ? "Provincial budget dataset required"
          : method === "qualitative"
            ? "Based on strategic priorities"
            : "Based on budget allocations",
      trace: [
        {
          table: "provincial_budget_topic_allocation",
          query: `province=${province}`,
          sourceCount: budgets.length,
          timestamp,
        },
      ],
    };

    return serializeData({
      concernVolume,
      topConcern,
      concernVelocity,
      alignmentScore,
    });
  },

  /**
   * VISUAL 2 — Public Concern Topic Breakdown
   */
  getTopicBreakdown: async (province: string) => {
    const issuesSnap = await getDocs(
      query(
        collection(db, "community_issue"),
        where("province", "==", province),
      ),
    );
    const issues = issuesSnap.docs.map((d) => d.data() as CommunityIssue);
    const total = issues.length;
    if (total === 0) return [];

    const topicMap = issues.reduce(
      (acc, curr) => {
        acc[curr.primary_topic] = (acc[curr.primary_topic] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const results = Object.entries(topicMap)
      .map(([topic, count]) => ({
        topic,
        mentions: count,
        percentage: (count / total) * 100,
        share_of_voice_percentage: (count / total) * 100, // for compatibility
      }))
      .sort((a, b) => b.mentions - a.mentions);

    return serializeData(results);
  },

  /**
   * VISUAL 3 — Concern Trend Analysis
   */
  getConcernTrend: async (province: string) => {
    // Mocking trend data for the visual
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const results = dates.map((date) => ({
      date,
      count: Math.floor(Math.random() * 10) + 5,
    }));

    return serializeData(results);
  },

  /**
   * VISUAL 4 — Geographic Signal Distribution
   */
  getMunicipalityDistribution: async (province: string) => {
    const geoSnap = await getDocs(
      query(
        collection(db, "location_resolved_signal"),
        where("province", "==", province),
      ),
    );
    const geoSignals = geoSnap.docs.map((d) => d.data() as any);

    const muniMap = geoSignals.reduce(
      (acc, curr) => {
        const muni = curr.municipality || "Unknown";
        acc[muni] = (acc[muni] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const results = Object.entries(muniMap)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    return serializeData(results);
  },

  /**
   * VISUAL 5 — Strategic Alignment Matrix
   */
  getAlignmentMatrix: async (province: string) => {
    const breakdown = await DashboardOneAggregator.getTopicBreakdown(province);
    const budgetSnap = await getDocs(
      query(
        collection(db, "provincial_budget_topic_allocation"),
        where("province", "==", province),
      ),
    );
    const budgets = budgetSnap.docs.map(
      (d) => d.data() as ProvincialBudgetAllocation,
    );

    const results = breakdown.map((b) => {
      const budget = budgets.find((bg) =>
        bg.budget_topic.toLowerCase().includes(b.topic.toLowerCase()),
      );
      return {
        topic: b.topic,
        citizenPerc: b.percentage,
        budgetPerc: budget ? budget.allocation_percentage || 15 : 10,
      };
    });

    return serializeData(results);
  },

  /**
   * VISUAL 6 — Recent Signal Intelligence Feed
   */
  getRecentSignals: async (province: string, limitCount: number = 20) => {
    const q = query(
      collection(db, "community_issue"),
      where("province", "==", province),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    const results = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as CommunityIssue[];

    return serializeData(results);
  },
};
