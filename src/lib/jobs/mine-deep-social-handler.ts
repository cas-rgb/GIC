import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchCommunityData } from "@/services/tavily-service";
import { query } from "@/lib/db/index";
import crypto from "crypto";

const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const LEADER_MATRIX: Record<string, string> = {
  "Gauteng": "Premier Panyaza Lesufi",
  "Western Cape": "Premier Alan Winde",
  "KwaZulu-Natal": "Premier Thami Ntuli",
  "Eastern Cape": "Premier Oscar Mabuyane",
  "Free State": "Premier MaQueen Letsoha-Mathae",
  "Limpopo": "Premier Phophi Ramathuba",
  "Mpumalanga": "Premier Mandla Ndlovu",
  "North West": "Premier Kagiso Lazarus Mokgosi",
  "Northern Cape": "Premier Zamani Saul",
  "All Provinces": "President Cyril Ramaphosa"
};

const MUNICIPAL_LEADER_MATRIX: Record<string, Record<string, string>> = {
  "Gauteng": {
      "City of Johannesburg": "Mayor Dada Morero",
      "City of Tshwane": "Mayor Cilliers Brink",
      "City of Ekurhuleni": "Mayor Nkosindiphile Xhakaza"
  },
  "KwaZulu-Natal": {
      "eThekwini": "Mayor Cyril Xaba"
  },
  "Western Cape": {
      "City of Cape Town": "Mayor Geordin Hill-Lewis"
  }
};

const PROMPT_TEMPLATE = `
You are an expert digital intelligence analyst for the South African Government.
Analyze the following deep web search data retrieved for {LEADER} and broader service delivery issues in {PROVINCE}. 
Extract and synthesize the data into a strictly formatted JSON array capturing specific narrative mentions and platform velocities.

CRITICAL INSTRUCTION: DO NOT HALLUCINATE OR INVENT ANY URLS. Extract ONLY from the RAW WEB DATA.

Return ONLY a raw JSON strictly matching this schema:
{
  "documents": [
    {
      "title": "Exact Headline tracking the leader or infrastructure crisis",
      "url": "EXTRACT THE EXACT URL FROM THE RAW WEB DATA",
      "content_text": "A brief 2 sentence summary of what happened",
      "doc_type": "news_article" // or 'youtube_video' if the URL is from YouTube
    }
  ],
  "leaderInsights": [
     {
        "leaderName": "{LEADER}",
        "office": "Office of the Premier",
        "topic": "Electricity, Water, Governance, etc.",
        "sentimentScore": 20, // numeric, between 0 (highly negative) and 100 (highly positive)
        "confidence": 0.9,
        "sentimentLabel": "Negative", // 'Positive', 'Neutral', 'Negative'
        "evidenceText": "Extract exactly 1 sentence from the raw text proving this sentiment."
     }
  ],
  "platformVelocity": [
    {
      "platform": "X", // X, LinkedIn, Facebook, YouTube
      "trendingTopic": "The #1 extracted crisis/complaint topic on this platform for this province",
      "threatLevel": "High", // High, Medium, Low
      "tractionScore": 85,
      "description": "Extract 2 sentences of context about what the community is saying on this platform."
    }
  ]
}

RAW WEB DATA:
{SEARCH_CONTENT}
`;

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch (error) {
    return null;
  }
}

export async function processMineDeepSocialJob(payload: { province: string, municipality?: string }) {
  const province = payload.province;
  const municipality = payload.municipality;
  
  let leaderTarget = LEADER_MATRIX[province] || LEADER_MATRIX["All Provinces"];
  let isMunicipal = false;

  if (municipality && MUNICIPAL_LEADER_MATRIX[province] && MUNICIPAL_LEADER_MATRIX[province][municipality]) {
      leaderTarget = MUNICIPAL_LEADER_MATRIX[province][municipality];
      isMunicipal = true;
  }
  
  const geographicRegion = isMunicipal ? municipality : province;
  console.log("--- Targeted Web Extraction for: " + leaderTarget + " in " + geographicRegion + " ---");

  const searchQueries = [
    `"${leaderTarget}" ${geographicRegion === "All Provinces" ? "South Africa" : geographicRegion} service delivery complaints news past month`,
    `"${geographicRegion === "All Provinces" ? "South Africa" : geographicRegion}" infrastructure issues YouTube videos X twitter complaints past month`
  ];

  let combinedContent = "";
  for (const q of searchQueries) {
    try {
      const searchData = await searchCommunityData(q);
      if (searchData && searchData.results) {
        combinedContent += searchData.results.map((r: any) => "Title: " + r.title + "\nURL: " + r.url + "\nContent: " + (r.content || r.snippet) + "\n\n").join("");
      }
    } catch (e) {
      console.error("  ❌ Tavily failed for " + q);
    }
  }

  const maxContent = combinedContent.substring(0, 30000);
  const prompt = PROMPT_TEMPLATE.replace(/{PROVINCE}/g, geographicRegion || province).replace(/{LEADER}/g, leaderTarget).replace("{SEARCH_CONTENT}", maxContent);

  let rawText = "";
  let success = false;
  for (let i = 0; i < 4; i++) {
      try {
          const result = await geminiFlash.generateContent(prompt);
          rawText = result.response.text();
          success = true;
          break;
      } catch(e: any) {
          if (e.status === 503 || e.status === 429) {
             console.log("  ⚠️ Gemini API Demand Splike (503). Retrying in " + (5000 * (i+1)) + "ms...");
             await new Promise(r => setTimeout(r, 5000 * (i+1)));
          } else {
             throw e;
          }
      }
  }

  if (!success) {
      throw new Error("Gemini API consistently failed after 4 retries.");
  }
  
  const data = extractJson(rawText);

  if (!data || (!data.documents && !data.leaderInsights)) {
    throw new Error("Invalid or empty JSON generated from Gemini.");
  }

  console.log("  Writing OSINT insights natively to PostgreSQL...");
  let docId: string | null = null;

  if (data.documents && data.documents.length > 0) {
     const sourceRes = await query("SELECT id FROM sources LIMIT 1");
     let sourceId = sourceRes.rows?.[0]?.id;
     if (!sourceId) {
         sourceId = crypto.randomUUID();
         await query("INSERT INTO sources (id, name, type) VALUES ($1, 'Strategic OSINT Engine', 'NEWS')", [sourceId]);
     }

     for (const doc of data.documents) {
         docId = docId || crypto.randomUUID();
         let targetType = 'article';
         const docUrl = doc.url || "";
         if (docUrl.includes("youtube.com") || docUrl.includes("youtu.be")) targetType = "youtube_video";
         else if (docUrl.includes("twitter.com") || docUrl.includes("x.com")) targetType = "tweet";
         else if (docUrl.includes("facebook.com")) targetType = "facebook_post";
         else if (docUrl.includes("linkedin.com")) targetType = "linkedin_post";

         await query(
           "INSERT INTO documents (id, title, url, content_text, status, doc_type, source_id, parser_version) VALUES ($1, $2, $3, $4, 'active', $5, $6, '1.0.0') ON CONFLICT DO NOTHING",
           [docId, doc.title, doc.url, doc.content_text, targetType, sourceId]
         );
     }
  }

  if (data.leaderInsights && data.leaderInsights.length > 0) {
      for (const insight of data.leaderInsights) {
          if (isMunicipal) {
              await query(
                 "INSERT INTO municipal_leader_mentions (id, document_id, sentiment_score, confidence, topic, sentiment_label, evidence_text, province, municipality, leader_name, office) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
                 [crypto.randomUUID(), docId, insight.sentimentScore || 50, insight.confidence || 0.8, insight.topic || 'Governance', (insight.sentimentLabel || 'neutral').toLowerCase(), insight.evidenceText || '', province, municipality, insight.leaderName, insight.office]
              );
          } else {
              await query(
                 "INSERT INTO leader_mentions (id, document_id, sentiment_score, confidence, topic, sentiment_label, evidence_text, province, leader_name, office) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                 [crypto.randomUUID(), docId, insight.sentimentScore || 50, insight.confidence || 0.8, insight.topic || 'Governance', (insight.sentimentLabel || 'neutral').toLowerCase(), insight.evidenceText || '', province, insight.leaderName, insight.office]
              );
          }
      }
  }

  if (data.platformVelocity && data.platformVelocity.length > 0) {
      for (const v of data.platformVelocity) {
          await query(
             "INSERT INTO social_narratives (id, title, description, threat_level, source_platform, province, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())",
             [crypto.randomUUID(), v.trendingTopic || 'Governance', v.description || '', v.threatLevel || 'Uncategorized', v.platform || 'X', province]
          );
      }
  }

  console.log("  ✅ Successfully bound live AI extraction matrix for " + leaderTarget + " into PostgreSQL.");
}
