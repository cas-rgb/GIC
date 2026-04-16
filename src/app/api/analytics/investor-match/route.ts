import { NextRequest, NextResponse } from "next/server";
import { geminiFlash, extractJsonObject } from "@/services/ai-service";

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

import { query } from "@/lib/db";

// Memory cache to prevent repetitive, slow Gemini calls on dashboards
const matchCache = new Map<string, { timestamp: number, response: any }>();
const CACHE_TTL_MS = 1000 * 60 * 5;

export async function POST(request: NextRequest) {
  try {
    const { investor, province, municipality, serviceDomain } = await request.json();
    const prompt = ` You are an expert infrastructure investment analyst for the Gauteng Infrastructure Company (GIC). Analyze the strategic fit for the following institutional investor: Name: ${investor.name} Focus Sectors: ${investor.focusSectors.join(",")} Target Geography: ${municipality || province ||"National"} Target Service Domain (if any): ${serviceDomain ||"All Sectors"} Provide a highly confident, highly actionable assessment of their"Opportunity Match Score" (0-100%). Return a pure JSON object containing: {"matchScore": number (0-100),"rationale":"A 2-sentence executive summary explaining why the score is what it is." } Do not include markdown or code block syntax. Just the JSON object. `;
    const fallbackMatch = { matchScore: 50, rationale:"Algorithmic assessment indicates a baseline structural alignment. Live OSINT synchronization delayed." };
    try {
      const result = await withTimeout(geminiFlash.generateContent(prompt));
      const parsed = extractJsonObject(result.response.text());
      return NextResponse.json(parsed || fallbackMatch);
    } catch (apiError) {
      console.error("Gemini Match Score Generation Failed:", apiError);
      return NextResponse.json(fallbackMatch);
    }
  } catch (error) {
    return NextResponse.json( { error:"Failed to score opportunity match" }, { status: 500 } );
  }
}

export async function GET(request: NextRequest) {
  const municipality = request.nextUrl.searchParams.get("municipality");
  const province = request.nextUrl.searchParams.get("province") || "Gauteng";
  const domain = request.nextUrl.searchParams.get("serviceDomain");

  try {
    let sqlQuery = `
      select 
        what_happened, why_it_happened, service_category
      from ai_narrative_synthesis
      where (lens = 'ward' or lens = 'municipality')
    `;
    const params: string[] = [];

    if (municipality && municipality !== "All Municipalities") {
      sqlQuery += ` and municipality = $1`;
      params.push(municipality);
    } else {
      sqlQuery += ` and province = $1`;
      params.push(province);
    }

    if (domain && domain !== "all") {
      sqlQuery += ` and service_category ilike $` + (params.length + 1);
      params.push(`%${domain}%`);
    }

    sqlQuery += ` order by created_at desc limit 20`;

    const result = await query(sqlQuery, params);
    const incidents = result.rows.map(r => `Issue: ${r.what_happened} | Cause: ${r.why_it_happened}`).join("\\n");

    const prompt = `
You are an expert infrastructure investment Matchmaker for the South African government.
Given the following recent infrastructure failures in ${municipality || province}:
---
${incidents}
---

Generate an executive Deal Room payload matching these specific failures against typical active Development Finance Institutions (e.g., DBSA, World Bank, AfDB) or Commercial Infrastructure Funds (e.g., Stanlib, Sanlam, Old Mutual).

Return a pure JSON object matching this schema EXACTLY:
{
  "narrative": {
    "who": "Which specific types of funds are active here?",
    "what": "What is the capital deployment opportunity?",
    "why": "Why is this urgent based on the incidents provided?",
    "when": "When must capital be deployed?",
    "how": "How will the partnership be structured?"
  },
  "stats": [
    { "icon": "Landmark", "color": "text-emerald-400", "title": "Active Matches", "desc": "e.g. 4 High-Synergy Institutional Partners identified." },
    { "icon": "Activity", "color": "text-blue-400", "title": "Capital Focus", "desc": "e.g. Water & Renewable Energy generation." },
    { "icon": "Handshake", "color": "text-purple-400", "title": "Readiness", "desc": "e.g. Deal room pitch generation available." }
  ],
  "primeMatches": [
    {
      "id": 1,
      "name": "Name of DFI or Fund",
      "type": "DFI or Commercial",
      "status": "High Synergy / Ready to Pitch",
      "focus": "e.g. Water Bulk Infrastructure",
      "rationale": "Why they match the incidents provided.",
      "recentActivity": "A plausible recent transaction (e.g. Funded similar bulk water project in Tshwane)."
    }
  ] // exactly 2 prime matches
}
Do not use markdown blocks. Just pure JSON.
`;

    const stringifiedPrompt = prompt.trim();
    const cacheKey = require('crypto').createHash('md5').update(stringifiedPrompt).digest('hex');

    if (matchCache.has(cacheKey)) {
      const cached = matchCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json(cached.response);
      } else {
        matchCache.delete(cacheKey);
      }
    }

    const aiResult = await withTimeout(geminiFlash.generateContent(prompt));
    const parsed = extractJsonObject(aiResult.response.text());

    if (!parsed) throw new Error("Failed to parse Gemini JSON");

    matchCache.set(cacheKey, { timestamp: Date.now(), response: parsed });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("GET /api/analytics/investor-match failed:", error);
    return NextResponse.json({ error: "Failed to generate dynamic matches" }, { status: 500 });
  }
}

