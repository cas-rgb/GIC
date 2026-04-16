import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const API_SOURCE_NAME = "Automated Budget OSINT Scraper";
const API_SOURCE_URL = "https://tavily.com/search";

async function ensureSource(queryFn: any): Promise<string> {
  const existing = await queryFn(
    `select id from sources where name = $1 limit 1`,
    [API_SOURCE_NAME]
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await queryFn(
    `insert into sources (name, source_type, base_url, reliability_score, active)
     values ($1, 'gov', $2, 0.850, true) returning id`,
    [API_SOURCE_NAME, API_SOURCE_URL]
  );
  return inserted.rows[0].id;
}

async function main() {
  const { query } = require("../src/lib/db");
  const { searchCommunityData } = require("../src/services/tavily-service");
  const { extractJsonArray } = require("../src/services/ai-service");
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
  const geminiPro = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
  const { createHash } = require("crypto");

  const sourceId = await ensureSource(query);

  const targets = [
    { province: "Gauteng", search: "Gauteng State of the Province Address SOPA 2024 2025 infrastructure budget allocations capital projects" },
    { province: "Western Cape", search: "Western Cape MTREF 2024 2025 infrastructure budget capital projects allocation" },
    { province: "KwaZulu-Natal", search: "KwaZulu-Natal 2024 2025 capital budget infrastructure spending SOPA" },
    { province: "Eastern Cape", search: "Eastern Cape infrastructure budget 2024 2025 MTREF capital projects" }
  ];

  for (const t of targets) {
    console.log(`[OSINT] Querying Tavily for ${t.province}...`);
    const results = await searchCommunityData(t.search);
    
    if (!results || !results.results || results.results.length === 0) {
      console.log(`[OSINT] No search results returned for ${t.province}.`);
      continue;
    }

    const contextBlock = results.results.map((r: any) => `URL: ${r.url}\nCONTENT: ${r.content}`).join("\n\n");

    console.log(`[Gemini] Synthesizing capital projects for ${t.province} from OSINT payload...`);
    const prompt = `
      You are an institutional financial analyst evaluating unstructured State of the Province and MTREF budget documents.
      Search the following context blocks for explicit infrastructure capital projects, allocations, and commitments for the 2024/2025 or 2025/2026 pipelines in ${t.province}.

      Extract the infrastructure projects into a JSON array of objects.
      IMPORTANT: If no numerical amount is specified, you can estimate based on massive/medium scale, but try to find the ZAR value.
      Respond ONLY with the JSON array.

      Format:
      [
        {
          "projectName": "Specific Name of the Project or Initiative",
          "municipality": "(Optional) specific city/municipality if mentioned, else null",
          "amountStr": "Extract the ZAR value, e.g., '500000000' for 500 Million, or '0' if unknown",
          "normalizedSector": "Choose from: Water and Sanitation, Roads and Transport, Electricity and Energy, Community Infrastructure, Housing and Settlements, Health, Other",
          "normalizedProjectStage": "Choose from: New Build, Upgrade, Renewal, Feasibility",
          "sourceUrl": "The URL from the context that provided this info"
        }
      ]

      CONTEXT:
      ${contextBlock}
    `;

    try {
      const gResult = await geminiPro.generateContent(prompt);
      const extractedProjects = extractJsonArray(gResult.response.text());

      console.log(`[PostgreSQL] Ingesting ${extractedProjects.length} OSINT projects for ${t.province}...`);

      const contentHash = createHash("sha256").update(t.search + new Date().toDateString()).digest("hex");
      
      const existingDoc = await query(`select id from documents where content_hash = $1 limit 1`, [contentHash]);
      let documentId;
      if (existingDoc.rows[0]) {
        documentId = existingDoc.rows[0].id;
      } else {
        const docInserted = await query(
          `insert into documents (source_id, url, title, published_at, fetched_at, doc_type, language, content_text, content_hash, parser_version, status)
           values ($1, $2, $3, now(), now(), 'budget', 'en', $4, $5, 'budget-osint-v1', 'active')
           returning id`,
          [sourceId, t.search, `[OSINT] ${t.province} Budget 2024/2025`, contextBlock, contentHash]
        );
        documentId = docInserted.rows[0].id;
      }

      for (const p of extractedProjects) {
        if (!p.projectName) continue;

        const locationKey = ["South Africa", t.province, "", p.municipality || "", ""].join("|");
        const locResult = await query(
          `
            insert into locations (country, province, municipality, location_key)
            values ('South Africa', $1, $2, $3)
            on conflict (location_key) do update set province = excluded.province returning id
          `,
          [t.province, p.municipality || null, locationKey]
        );
        const locId = locResult.rows[0].id;

        const numAmount = parseInt(String(p.amountStr).replace(/[^0-9]/g, "")) || 0;
        
        await query(
          `
            insert into infrastructure_projects (
              source_id, document_id, location_id,
              external_project_id, project_name, province, municipality,
              asset_class, project_description,
              latest_budget_year, latest_amount, total_known_expenditure,
              source_url, parser_version, status, raw_payload
            )
            values (
              $1, $2, $3,
              $4, $5, $6, $7,
              $8, $9,
              '2024/2025', $10, $11,
              $12, 'budget-osint-v1', 'active', $13::jsonb
            )
            on conflict (external_project_id) do update set
              latest_amount = excluded.latest_amount,
              total_known_expenditure = excluded.total_known_expenditure,
              updated_at = now()
          `,
          [
             sourceId, documentId, locId,
             `osint-budget-${t.province}-${p.projectName.substring(0,20).replace(/\s/g,'-')}-${Date.now()}`,
             `[OSINT] ${p.projectName}`, t.province, p.municipality || null,
             p.normalizedSector || 'Other',
             p.normalizedProjectStage || 'Upgrade',
             numAmount, numAmount,
             p.sourceUrl || "tavily", JSON.stringify(p)
          ]
        );
      }

    } catch (err) {
      console.error(`[Error] Failed processing ${t.province}:`, err);
    }
  }

  console.log("[Pipeline Complete] Hybrid OSINT-Treasury Data Architecture populated.");
  process.exit(0);
}

main().catch(console.error);
