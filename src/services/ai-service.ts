import {
  AISignal,
  PredictionData,
  EngagementStrategy,
  NarrativeDriver,
  RiskIndicator,
  StrategicRecommendation,
} from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini 3.1 Series (2026 Flagship)
export const geminiPro = genAI.getGenerativeModel({
  model: "gemini-3.1-pro-preview",
});
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
});
export const geminiEmbed = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

const TIMEOUT_MS = 15000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = TIMEOUT_MS): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`AI Generation Timeout: Exceeded ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

export function extractJsonArray(text: string): any[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.warn("Failed to parse JSON array from AI response:", error);
    return [];
  }
}

export function extractJsonObject(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    console.warn("Failed to parse JSON object from AI response:", error);
    return null;
  }
}

export async function analyzeCommunitySentiment(
  content: string,
  context?: string,
): Promise<AISignal[]> {
  const prompt = `
    As a GIC (Gauteng Infrastructure Company) Institutional Strategic Analyst, analyze the following community reports and technical data.
    Extract infrastructure-related signals with a focus on systemic risks and service delivery integrity:
    - Distinguish between "Load Reduction" (localized infrastructure constraints) and national "Load Shedding".
    - Identify "Service Disruptions" or "Community Protests" as indicators of operational risk.
    - Analyze "Unauthorized Mining Activities" in relation to structural integrity and geotechnical risks.
    - Map facilities (clinics, substations, provincial routes) to their specific administrative regions.

    SEARCH CONTEXT:
    ${context || "No additional context provided."}

    Format your response as a JSON array of objects following a professional storytelling flow:
    {
      "community": "Name (exact municipality or town)",
      "issue": "Specific infrastructure challenge (e.g., secondary substation failure)",
      "sentiment": "positive|neutral|negative",
      "urgency": 1-100,
      "evidence": "Factual synthesis or verified source excerpt",
      "source": "Institutional Source/URL",
      "category": "Civil|Roads|Health|Planning|Structural"
    }
    
    Content: ${content}
  `;

  try {
    const result = await withTimeout(geminiFlash.generateContent(prompt));
    return extractJsonArray(result.response.text());
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return [];
  }
}

export async function analyzeNarrativeAmplification(
  content: string,
): Promise<NarrativeDriver[]> {
  const prompt = `Analyze institutional narrative drivers for the following infrastructure context: ${content}. Return a JSON array of NarrativeDriver objects.`;
  try {
    const result = await withTimeout(geminiPro.generateContent(prompt));
    return extractJsonArray(result.response.text());
  } catch (error) {
    console.error("Narrative Analysis Error:", error);
    return [];
  }
}

export async function getPredictiveRiskScore(
  signals: AISignal[],
): Promise<RiskIndicator[]> {
  const prompt = `Calculate predictive risk scores for these infrastructure signals: ${JSON.stringify(signals)}. Return a JSON array of RiskIndicator objects.`;
  try {
    const result = await withTimeout(geminiFlash.generateContent(prompt));
    return extractJsonArray(result.response.text());
  } catch (error) {
    console.error("Risk Prediction Error:", error);
    return [];
  }
}

export async function generateStrategicRecommendations(
  risks: RiskIndicator[],
  province: string,
): Promise<StrategicRecommendation> {
  const prompt = `As a GIC analyst, generate strategic recommendations for ${province} based on these risks: ${JSON.stringify(risks)}. Return a JSON object for StrategicRecommendation.`;
  try {
    const result = await withTimeout(geminiPro.generateContent(prompt));
    const data = extractJsonObject(result.response.text());
    return (
      data || {
        timing: "monitoring",
        framing: "Standard oversight",
        priorityCommunities: [],
        mitigationStrategy: "Maintain baseline monitoring",
      }
    );
  } catch (error) {
    console.error("Recommendation Error:", error);
    return {
      timing: "monitoring",
      framing: "Neutral community engagement",
      priorityCommunities: [],
      mitigationStrategy: "Continue baseline monitoring",
    };
  }
}

export async function forecastInfraDemand(
  community: string,
  category: string,
  history: string,
): Promise<PredictionData> {
  const prompt = `Forecast infrastructure demand (6mo, 12mo, 36mo) for ${community} in ${category} category. History: ${history}. Return JSON object.`;
  try {
    const result = await withTimeout(geminiFlash.generateContent(prompt));
    const data = extractJsonObject(result.response.text());
    return (
      data || {
        forecast6mo: 0,
        forecast12mo: 0,
        forecast36mo: 0,
        confidence: 0.5,
      }
    );
  } catch (error) {
    console.error("Forecast Error:", error);
    return {
      forecast6mo: 2,
      forecast12mo: 5,
      forecast36mo: 12,
      confidence: 0.3,
    };
  }
}

export async function generateEngagementStrategy(
  community: string,
  signals: string,
): Promise<EngagementStrategy[]> {
  const prompt = `Design a community engagement strategy for ${community} based on these signals: ${signals}. Return JSON array of EngagementStrategy.`;
  try {
    const result = await withTimeout(geminiPro.generateContent(prompt));
    return extractJsonArray(result.response.text());
  } catch (error) {
    console.error("Engagement Strategy Error:", error);
    return [];
  }
}
