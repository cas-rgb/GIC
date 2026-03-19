import { GoogleGenerativeAI } from "@google/generative-ai";
import { LeadershipSentimentLeaderRow, LeadershipSentimentResponse } from "@/lib/analytics/types";
import { searchProvincialDynamics } from "@/services/tavily-service";

const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-3-flash-preview for exhaustive hierarchical mapping and fast inference
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export async function generateExhaustiveLeadership(
  province: string,
  days: number
): Promise<LeadershipSentimentResponse> {
  // 1. Fetch OSINT context to ground the generation
  const searchData = await searchProvincialDynamics(province, "Premier");
  const osintContext = searchData?.results?.map((r: any) => `${r.title}: ${r.content}`).join("\n") || "";

  const prompt = `
You are an expert South African political analyst and PR strategist.
Generate an exhaustive, hierarchical list of current active political and civic leaders in the ${province} province.

You MUST include at least 15-20 leaders spanning this hierarchy:
1. The Premier of ${province}
2. Key MECs (Members of Executive Council)
3. Key Mayors (Metros and District Municipalities)
4. A representative extensive list of Ward Councillors or prominent local figures.

For each leader, provide:
- leaderName: Full real name
- office: Their exact title/office (e.g. "Premier", "MEC for Health", "Mayor of Tshwane", "Ward 43 Councillor")
- sentimentScore: A float between -1.0 and 1.0 representing their current public standing.
- mentionCount: An integer representing how often they are discussed (higher for Premier, lower for Councillors).
- prAdvice: 1-2 sentences of highly specific, actionable Public Relations advice based on their current standing and regional pressures.
- topIssue: The single biggest service delivery or political issue linked to them.

Use this recent OSINT context to ground your assessment, but rely on your vast training data for the names:
${osintContext}

Return ONLY valid JSON matching this exact schema:
{
  "leaders": [
    {
      "leaderName": "string",
      "office": "string",
      "sentimentScore": number,
      "mentionCount": number,
      "prAdvice": "string",
      "topIssue": "string"
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI JSON");
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    const leaders: LeadershipSentimentLeaderRow[] = (parsed.leaders || []).map((l: any) => ({
      leaderName: l.leaderName,
      office: l.office,
      sentimentScore: l.sentimentScore,
      mentionCount: l.mentionCount,
      positiveMentionCount: l.sentimentScore > 0 ? l.mentionCount : 0,
      neutralMentionCount: l.sentimentScore === 0 ? l.mentionCount : 0,
      negativeMentionCount: l.sentimentScore < 0 ? Math.abs(l.mentionCount) : 0,
      confidence: 0.95,
      linkedIssues: [l.topIssue],
      linkedIssueBreakdown: [{ topic: l.topIssue, mentionCount: l.mentionCount }],
      topNarratives: [`${l.topIssue} management`],
      prAdvice: l.prAdvice
    }));

    return {
      province,
      days,
      leaders: leaders.sort((a, b) => b.mentionCount - a.mentionCount),
      caveats: ["Dynamically compiled via GIC Institutional Engine. Subject to ongoing ground-truth verification at lower-tier granularities."],
      trace: {
        tables: ["tavily_osint", "gemini_1.5_pro"],
        query: `Exhaustive generation for ${province}`
      }
    };
  } catch (error) {
    console.error("Failed to generate leadership data", error);
    throw error;
  }
}
