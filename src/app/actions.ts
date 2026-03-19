"use server";

import { searchCommunityData, deepResearch } from "@/services/tavily-service";
import {
  AISignal,
  PredictionData,
  EngagementStrategy,
  NarrativeDriver,
  RiskIndicator,
  StrategicRecommendation,
  AdvancedInsights,
} from "@/types";
import {
  analyzeCommunitySentiment,
  forecastInfraDemand,
  generateEngagementStrategy,
  analyzeNarrativeAmplification,
  getPredictiveRiskScore,
  generateStrategicRecommendations,
} from "@/services/ai-service";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

// ... existing actions ...

// Server Action for Narrative Analysis
export async function getNarrativeAnalysis(content: string) {
  "use server";
  try {
    const drivers = await analyzeNarrativeAmplification(content);
    return { success: true, data: drivers };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Predictive Risk
export async function getPredictiveRisk(signals: AISignal[]) {
  "use server";
  try {
    const risks = await getPredictiveRiskScore(signals);
    return { success: true, data: risks };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Strategic Recommendations
export async function getStrategicRecommendationsAction(
  risks: RiskIndicator[],
  province: string,
) {
  "use server";
  try {
    const recommendation = await generateStrategicRecommendations(
      risks,
      province,
    );
    return { success: true, data: recommendation };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to trigger deep research and save to Firestore
export async function performDeepResearchAction(
  communityId: string,
  communityName: string,
) {
  "use server";

  try {
    // 1. Tavily Search
    const searchResults = await searchCommunityData(
      `${communityName} infrastructure news sentiment 2024`,
    );
    const context = JSON.stringify(searchResults);

    // 2. Vertex AI Analysis
    const signals = await analyzeCommunitySentiment(context);

    // 3. Save to Firestore
    const signalsRef = collection(db, "community_signals");
    for (const signal of signals) {
      await addDoc(signalsRef, {
        ...signal,
        communityId,
        timestamp: serverTimestamp(),
      });
    }

    return { success: true, count: signals.length };
  } catch (error) {
    console.error("Action Error:", error);
    return { success: false, error: String(error) };
  }
}

// Server Action for Demand Forecasting
export async function triggerForecastingAction(
  communityId: string,
  communityName: string,
  category: string,
) {
  "use server";

  try {
    // Fetch recent signals for context
    const q = query(
      collection(db, "community_signals"),
      where("communityId", "==", communityId),
    );
    const snapshot = await getDocs(q);
    const history = snapshot.docs.map((d) => d.data().content).join("\n");

    const forecast = await forecastInfraDemand(
      communityName,
      category,
      history,
    );

    // Update predictions collection
    const predRef = collection(db, "infrastructure_predictions");
    await addDoc(predRef, {
      ...forecast,
      communityId,
      category,
      timestamp: serverTimestamp(),
    });

    return { success: true, forecast };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Executive Briefing (Regional Synthesis)
export async function getExecutiveBriefing() {
  "use server";
  try {
    const q = query(
      collection(db, "community_signals"),
      orderBy("timestamp", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    const signals = snapshot.docs.map((doc) => doc.data().issue).join(". ");

    // This would call Vertex AI to synthesize in a real scenario
    return {
      success: true,
      briefing: `Strategic priority: ${signals.slice(0, 150)}... Infrastructure resilience remains the primary goal across target provinces.`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action for Advanced Executive Insights (Velocity, Proportionality, Matrix)
export async function getAdvancedInsights() {
  "use server";
  try {
    const q = query(
      collection(db, "community_signals"),
      orderBy("timestamp", "desc"),
    );
    const snapshot = await getDocs(q);
    const signals = snapshot.docs.map((doc) => doc.data());

    if (signals.length === 0) {
      return {
        success: true,
        data: {
          proportionality: [],
          velocity: 0,
          reliability: 85,
          totalSignals: 0,
        },
      };
    }

    // 1. Category Proportionality
    const sectors = ["Civil", "Roads", "Health", "Planning", "Structural"];
    const proportionality = sectors.map((sector) => ({
      name: sector,
      value: signals.filter((s) => s.category === sector).length,
    }));

    // 2. Sentiment Velocity (Simplified acceleration over last 100 signals)
    const recent = signals.slice(0, 100);
    const older = signals.slice(100, 200);

    const getAvgSentiment = (arr: AISignal[]) => {
      if (arr.length === 0) return 50;
      const scores = arr.map((s) =>
        s.sentiment === "positive" ? 90 : s.sentiment === "negative" ? 10 : 50,
      );
      return scores.reduce((a, b) => a + b, 0) / arr.length;
    };

    const velocity =
      getAvgSentiment(recent as AISignal[]) -
      getAvgSentiment(older as AISignal[]);

    // 3. Influencer/Source Reliability (Signals grounded in News vs Social)
    const newsGrounded = signals.filter(
      (s: any) =>
        s.source &&
        (s.source.includes("gov.za") || s.source.includes("news24")),
    ).length;
    const socialGrounded = signals.filter((s: any) => s.platform).length;

    const data: AdvancedInsights = {
      proportionality,
      velocity: Math.round(velocity),
      reliability: Math.round((newsGrounded / signals.length) * 100) || 85,
      totalSignals: signals.length,
    };

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Advanced Insights Error:", error);
    return { success: false, error: String(error) };
  }
}

// Server Action for Strategic Intelligence (Silent Demand, Lookalikes)
export async function getStrategicInsights(serviceId: string = "apex") {
  "use server";
  try {
    const docRef = doc(db, "service_strategic_insights", serviceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return {
      success: false,
      error: `No strategic insights found for ${serviceId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch grounded project vulnerability scores
export async function getProjectVulnerability(projectId: string) {
  "use server";
  try {
    const docRef = doc(db, "project_vulnerability_ledger", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: false, error: "No vulnerability data found" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch high-volume visual analytics
export async function getVisualAnalytics(serviceId: string = "apex") {
  "use server";
  try {
    const docRef = doc(db, "service_visual_analytics", serviceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return {
      success: false,
      error: `No visual analytics found for ${serviceId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch hierarchical logical intelligence
export async function getLogicalIntelligence(
  serviceId: string,
  province: string,
  municipality: string,
) {
  "use server";
  try {
    const docId = `${serviceId}_${province}_${municipality}`.replace(
      /\s+/g,
      "_",
    );
    const docRef = doc(db, "gic_logical_intelligence", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }

    // Fallback to Province 'All' if specific municipality fails
    const fallbackId = `${serviceId}_${province}_All`.replace(/\s+/g, "_");
    const fallbackRef = doc(db, "gic_logical_intelligence", fallbackId);
    const fallbackSnap = await getDoc(fallbackRef);

    if (fallbackSnap.exists()) {
      return { success: true, data: fallbackSnap.data() };
    }

    return {
      success: false,
      error: `No logical intelligence found for ${docId}`,
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch live strategic news
export async function getStrategicNews(query: string, limit: number = 5) {
  "use server";
  try {
    const { fetchStrategicNews } = await import("@/services/news-service");
    const news = await fetchStrategicNews(query, limit);
    return { success: true, data: news };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
// Server Action to fetch grounded signals for a specific community/service
export async function getGroundedSignals(
  communityId: string,
  category: string,
) {
  "use server";
  try {
    const signalsRef = collection(db, "community_signals");
    const q = query(
      signalsRef,
      where("communityId", "==", communityId),
      where("category", "==", category),
      orderBy("timestamp", "desc"),
      limit(10),
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    console.error("Grounded Signals Error:", error);
    // Fallback to searching if no seeded data exists
    return { success: false, error: String(error) };
  }
}

// Server Action to fetch all signals for a province/service (Apex)
export async function getRegionalPulse(province: string, serviceId: string) {
  "use server";
  try {
    const signalsRef = collection(db, "community_signals");
    const q = query(
      signalsRef,
      where("category", "==", serviceId === "apex" ? "Apex" : serviceId),
      orderBy("timestamp", "desc"),
      limit(20),
    );
    const snapshot = await getDocs(q);
    return {
      success: true,
      data: snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
