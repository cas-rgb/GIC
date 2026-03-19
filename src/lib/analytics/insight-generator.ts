import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
// Use Gemini 3 Flash for fast, structured generation
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const TIMEOUT_MS = 15000;

// Simple in-memory cache to prevent redundant Gemini calls and stabilize dashboard load times natively
const insightCache = new Map<string, { timestamp: number, response: any }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

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

export interface ControlledInsightResponse {
  quantification: string;
  means: string;
  motive: string;
  opportunity: string;
  five_whys: string[];
  what_if: string;
  confidence_note: string;
}

const MASTER_PROMPT_TEMPLATE = `
## Generate Structured Insights from Governed Metrics Only

You are generating executive insights for the GIC Intelligence Platform.

You are NOT allowed to:
* read raw articles
* infer from unstructured text
* fabricate explanations
* introduce external knowledge

You may ONLY use:
* governed metric tables
* aggregated datasets
* confidence scores
* trace metadata

---

# INPUT STRUCTURE

You will receive structured data in this format:

\`\`\`json
{METRICS_JSON}
\`\`\`

You must ONLY use this data.

---

# REQUIRED OUTPUT STRUCTURE

Generate insight using the following framework:

---

## 1. HOW MUCH / HOW MANY

Summarise the situation using numbers.

Rules:
* include exact values or percentages
* do not generalise
* do not invent numbers

Example:
"Water-related issues account for 28% of all recorded concerns, with a total volume of 1,245 signals across the province."

---

## 2. MEANS, MOTIVE, OPPORTUNITY

### Means (what enables the issue)
Derive from: dominant issue categories, repeated patterns in topics

### Motive (why it is happening)
Derive from: sentiment trends, topic dominance, distribution patterns

### Opportunity (what can be done)
Derive from: high-frequency issues, underrepresented budget areas, emerging trends

Rules:
* must reference metrics
* must not be generic
* must not introduce new facts

---

## 3. FIVE WHYS

Generate a causal chain ONLY if:
* there is a dominant topic
* sufficient supporting signals exist

Structure:
Why 1 -> direct observation
Why 2 -> inferred from pattern
Why 3 -> inferred from repeated signals
Why 4 -> inferred from structural pattern
Why 5 -> inferred systemic cause

Rules:
* max 5 levels
* stop early if confidence drops
* if insufficient data -> say so

---

## 4. WHAT IF (SCENARIO)

Generate forward-looking insights based on trends.

Rules:
* must be tied to trend direction
* must not be presented as fact
* must include uncertainty language

Example:
"If current trends continue, water-related issues may become the dominant service delivery concern within the next reporting period."

---

# 🚨 HARD CONSTRAINTS

1. Every statement must map to a metric
2. Do not introduce new entities
3. Do not guess causes not supported by data
4. If confidence is LOW -> explicitly state limitation
5. If data is missing -> say "Insufficient data"

---

# CONFIDENCE HANDLING

If confidence is:
### HIGH
Provide full analysis
### PARTIAL
Provide cautious interpretation
### LOW
Limit analysis and state uncertainty
### INSUFFICIENT
Do not generate insight

---

# OUTPUT FORMAT

Return structured insight strictly matching this JSON schema:
{
  "quantification": "...",
  "means": "...",
  "motive": "...",
  "opportunity": "...",
  "five_whys": ["..."],
  "what_if": "...",
  "confidence_note": "..."
}
`;

function extractJson(text: string): Record<string, any> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON object found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return {
      quantification: "Failed to parse AI response.",
      means: "Insufficient data",
      motive: "Insufficient data",
      opportunity: "Insufficient data",
      five_whys: ["Insufficient data"],
      what_if: "Insufficient data",
      confidence_note: "Error in generation.",
    };
  }
}

export async function generateControlledInsight(
  metricsData: any,
  province: string = "Gauteng",
  lens: string = "general"
): Promise<ControlledInsightResponse> {
  if (!apiKey) {
    return {
      quantification: "AI generation is disabled (Missing VERTEX_AI_API_KEY).",
      means: "Awaiting Data",
      motive: "Awaiting Data",
      opportunity: "Awaiting Data",
      five_whys: ["Awaiting Data"],
      what_if: "Awaiting Data",
      confidence_note: "Requires API Key",
    };
  }

  // Strict Fallback: Do not ask Gemini to hallucinate if the Postgres metrics are demonstrably empty.
  const mentionCount = metricsData?.public_sentiment?.mentionCount || 0;
  const provinceCount = metricsData?.community_signals?.totalIdentifiedProvinces || 0;
  const overviewCount = metricsData?.overview?.totalIssues || 0;

  let finalMetricsData = metricsData;

  if (mentionCount < 2 && provinceCount === 0 && overviewCount === 0) {
    console.log(`[ENRICHMENT] Edge detection: Internal data empty for ${lens} in ${province}. Triggering Tavily...`);
    try {
      const { tavily } = require("@tavily/core");
      const client = tavily({ apiKey: process.env.TAVILY_API_KEY || "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" });
      
      const searchResponse = await client.search(`${province} local news service delivery infrastructure ${lens.replace("_", " ")}`, {
        searchDepth: "advanced",
        includeAnswer: true,
        maxResults: 5
      });

      finalMetricsData = {
        enrichment_source: "Live Market Signals",
        confidence: "LOW",
        external_context: searchResponse.answer || searchResponse.results.map((r: any) => `${r.title}: ${r.content}`).join("\\n\\n")
      };
    } catch (e: any) {
      console.error("Next.js External O-SINT Enrichment Failed", e);
      return {
        quantification: "Awaiting active data pipeline. Enrichment fallback failed.",
        means: "Insufficient data",
        motive: "Insufficient data",
        opportunity: "Insufficient data",
        five_whys: ["Insufficient data"],
        what_if: "Insufficient data",
        confidence_note: `System bypassed autonomous routing algorithm over empty streams. Error: ${e.message}`,
      };
    }
  }

  try {
    const stringifiedMetrics = JSON.stringify(finalMetricsData, null, 2);
    const cacheKey = require('crypto').createHash('md5').update(stringifiedMetrics).digest('hex');

    if (insightCache.has(cacheKey)) {
      const cached = insightCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.response;
      } else {
        insightCache.delete(cacheKey);
      }
    }

    const prompt = MASTER_PROMPT_TEMPLATE.replace(
      "{METRICS_JSON}",
      stringifiedMetrics
    );

    const result = await withTimeout(model.generateContent(prompt));
    const responseText = result.response.text();
    const parsed = extractJson(responseText);

    const finalResponse = {
      quantification: parsed.quantification || "Insufficient data",
      means: parsed.means || "Insufficient data",
      motive: parsed.motive || "Insufficient data",
      opportunity: parsed.opportunity || "Insufficient data",
      five_whys: Array.isArray(parsed.five_whys) ? parsed.five_whys : ["Insufficient data"],
      what_if: parsed.what_if || "Insufficient data",
      confidence_note: parsed.confidence_note || "Data trace processed successfully.",
    };

    insightCache.set(cacheKey, { timestamp: Date.now(), response: finalResponse });
    
    return finalResponse;
  } catch (error) {
    console.error("AI Insight Generation failed:", error);
    return {
      quantification: "Service unavailable.",
      means: "Service unavailable.",
      motive: "Service unavailable.",
      opportunity: "Service unavailable.",
      five_whys: ["Service unavailable."],
      what_if: "Service unavailable.",
      confidence_note: "Model execution failed.",
    };
  }
}
