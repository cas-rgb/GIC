import { createRequire } from "module";
import { GoogleGenerativeAI } from "@google/generative-ai";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { pool, query } = require("../src/lib/db/index");
const { searchCommunityData } = require("../src/services/tavily-service");

// Initialise Gemini
const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// We want discrete events, NOT aggregations.
const PROMPT_TEMPLATE = `
You are an expert civic intelligence analyst. 
Analyze the following raw search data about {TARGET_NAME} ({LENS_TYPE}) in {PROVINCE}.
Identify DISCRETE, specific incidents, complaints, or events. DO NOT aggregate them into a general summary. 
For EACH specific event found, extract the Who, What, Why, When, and How.

Format your response as a pure JSON array of objects. Do not use markdown blocks.
[
  {
    "who_involved": "Specific people, organizations, or groups involved",
    "what_happened": "The exact discrete event, issue, or statement",
    "why_it_happened": "The underlying cause or explicitly stated grievance",
    "how_resolved_or_current": "The current status, planned intervention, or lack thereof",
    "when_timeline": "Specific dates, duration, or 'Recent/Ongoing'",
    "source_evidence": "A short 1-sentence quote or reference from the provided text validating this event",
    "service_category": "Classify EXACTLY as one of these: Water, Electricity, Roads, Housing, Healthcare, Civil & Governance, Waste & Refuse"
  }
]

RAW SEARCH DATA:
{SEARCH_CONTENT}
`;

function extractJsonArray(text: string): any[] {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.warn("Failed to parse JSON array:", error);
    return [];
  }
}

async function mineEventsForTarget(lens: string, targetName: string, province: string, searchQueries: string[]) {
  console.log(`\n--- Mining [${lens.toUpperCase()}] Target: ${targetName} ---`);
  
  // 1. Fetch raw data from Tavily
  let combinedContent = "";
  for (const q of searchQueries) {
    try {
      console.log(`  🔍 Searching Tavily: "${q}"`);
      const searchData = await searchCommunityData(q);
      if (searchData && searchData.results) {
        combinedContent += searchData.results.map((r: any) => `Title: ${r.title}\nContent: ${r.content || r.snippet}\n\n`).join("");
      }
    } catch (e) {
      console.error(`  ❌ Tavily search failed for '${q}'`, e);
    }
  }

  if (combinedContent.length < 50) {
    console.log(`  ⚠️ Not enough raw data found for ${targetName}. Skipping AI synthesis.`);
    return;
  }

  // Cap content length to avoid massive token costs
  const maxContent = combinedContent.substring(0, 30000); 

  // 2. Synthesize using Gemini
  console.log(`  🧠 Synthesizing ${maxContent.length} chars via Gemini Flash...`);
  const prompt = PROMPT_TEMPLATE
    .replace("{TARGET_NAME}", targetName)
    .replace("{LENS_TYPE}", lens)
    .replace("{PROVINCE}", province)
    .replace("{SEARCH_CONTENT}", maxContent);

  try {
    const result = await geminiFlash.generateContent(prompt);
    const events = extractJsonArray(result.response.text());

    console.log(`  ✅ Extracted ${events.length} DISCRETE events.`);

    // 3. Write purely discrete records into Postgres
    for (const ev of events) {
      await query(
        `insert into ai_narrative_synthesis (
          lens, province, municipality, leader_name,
          who_involved, what_happened, why_it_happened, 
          how_resolved_or_current, when_timeline, source_evidence, service_category
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          lens, 
          province, 
          (lens === 'municipality' || lens === 'ward') ? targetName : null, 
          lens === 'leadership' ? targetName : null,
          ev.who_involved,
          ev.what_happened,
          ev.why_it_happened,
          ev.how_resolved_or_current,
          ev.when_timeline,
          ev.source_evidence,
          ev.service_category || 'Civil & Governance'
        ]
      );
    }
    console.log(`  💾 Saved ${events.length} records to ai_narrative_synthesis.`);

  } catch (e) {
    console.error(`  ❌ Gemini synthesis failed for ${targetName}`, e);
  }
}

async function runMiner() {
  console.log("🚀 Starting Deep Data Miner (Non-Destructive Discrete Event Extraction)");
  
  // Example targets - in a real 6-hour run, we would query the `place_reference` and `leader` tables here
  // and iterate with a `setInterval` or `setTimeout` loop.
  
  const targets = [
    // Municipalities
    { lens: "municipality", name: "City of Johannesburg", province: "Gauteng", queries: ['"City of Johannesburg" service delivery problems news', '"City of Johannesburg" infrastructure failure'] },
    { lens: "municipality", name: "Ekurhuleni", province: "Gauteng", queries: ['"Ekurhuleni" service delivery news', '"Ekurhuleni" protests'] },
    // Explicit Neglected Wards
    { lens: "ward", name: "Alexandra Township", province: "Gauteng", queries: ['"Alexandra" "service delivery" protests news', '"Alexandra" "Gauteng" water electricity crisis', '"Alexandra" township living conditions'] },
    { lens: "ward", name: "Diepsloot", province: "Gauteng", queries: ['"Diepsloot" service delivery protests', '"Diepsloot" infrastructure crime', '"Diepsloot" water electricity'] },
    { lens: "ward", name: "Soweto (Various Wards)", province: "Gauteng", queries: ['"Soweto" electricity crisis Eskom', '"Soweto" water shortages Johannesburg Water'] },
    { lens: "ward", name: "Orange Farm / Evaton", province: "Gauteng", queries: ['"Orange Farm" OR "Evaton" service delivery problems infrastructure'] },
    // Social Media / General Province
    { lens: "social", name: "Gauteng General Social Trends", province: "Gauteng", queries: ['"Gauteng" AND ("water crisis" OR "power outage" OR "potholes") site:twitter.com OR site:facebook.com', '"Gauteng" community complaints "service delivery"'] }
  ];

  // Dynamically inject all Major Leaders in South Africa
  const majorLeaders = [
    // Premiers
    { name: "Panyaza Lesufi", province: "Gauteng", role: "Premier" },
    { name: "Alan Winde", province: "Western Cape", role: "Premier" },
    { name: "Thami Ntuli", province: "KwaZulu-Natal", role: "Premier" },
    { name: "Oscar Mabuyane", province: "Eastern Cape", role: "Premier" },
    { name: "Maqueen Letsoha-Mathae", province: "Free State", role: "Premier" },
    { name: "Phophi Ramathuba", province: "Limpopo", role: "Premier" },
    { name: "Mandla Ndlovu", province: "Mpumalanga", role: "Premier" },
    { name: "Lazarus Mokgosi", province: "North West", role: "Premier" },
    { name: "Zamani Saul", province: "Northern Cape", role: "Premier" },
    // Mayors
    { name: "Dada Morero", province: "Gauteng", role: "Mayor City of Johannesburg" },
    { name: "Nasiphi Moya", province: "Gauteng", role: "Mayor Tshwane" },
    { name: "Nkosindiphile Xhakaza", province: "Gauteng", role: "Mayor Ekurhuleni" },
    { name: "Cyril Xaba", province: "KwaZulu-Natal", role: "Mayor eThekwini" },
    { name: "Geordin Hill-Lewis", province: "Western Cape", role: "Mayor Cape Town" },
    { name: "Babalwa Lobishe", province: "Eastern Cape", role: "Mayor Nelson Mandela Bay" },
    { name: "Princess Faku", province: "Eastern Cape", role: "Mayor Buffalo City" },
    { name: "Gregory Nthatisi", province: "Free State", role: "Mayor Mangaung" },
  ];

  for (const leader of majorLeaders) {
    targets.push({
      lens: "leadership",
      name: leader.name,
      province: leader.province,
      queries: [
        `"${leader.name}" ${leader.role} "service delivery" OR infrastructure OR criticism`,
        `"${leader.name}" ${leader.province} statements OR complaints OR protests`
      ]
    });
  }

  try {
    console.log("Fetching ALL Wards in South Africa from database...");
    const { rows: allWards } = await query(
      "SELECT ward_name, municipality_name, province_name FROM ward_reference"
    );
    console.log(`🌍 Ingested ${allWards.length} Wards into the mining payload.`);
    
    // Spread the wards out so that the script processes them across the 6-hour window
    for (const w of allWards) {
      if (!w.ward_name || !w.municipality_name) continue;
      targets.push({
        lens: "ward",
        name: w.ward_name,
        province: w.province_name,
        queries: [
          `"${w.ward_name}" "${w.municipality_name}" service delivery OR protests`,
          `"${w.ward_name}" "${w.municipality_name}" water OR electricity OR outages`,
          `"${w.ward_name}" "${w.municipality_name}" roads OR potholes OR infrastructure`,
          `"${w.ward_name}" "${w.municipality_name}" housing OR healthcare OR clinic`,
          `"${w.ward_name}" "${w.municipality_name}" waste OR refuse OR illegal dumping`
        ]
      });
    }
  } catch (error) {
    console.error("Failed to inject dynamic Wards from database:", error);
  }

  for (const target of targets) {
    // Dedup check: Avoid extracting data for target if we already have records today.
    let skip = false;
    try {
      if (target.lens === 'leadership') {
         const { rows } = await query("SELECT count(*) as count FROM ai_narrative_synthesis WHERE lens = 'leadership' AND leader_name = $1", [target.name]);
         if (parseInt(rows[0].count) > 0) {
            console.log(`  ⏭️ Skipping Leader [${target.name}] - Already extracted in database.`);
            skip = true;
         }
      } else if (target.lens === 'ward' || target.lens === 'municipality') {
         const { rows } = await query("SELECT count(*) as count FROM ai_narrative_synthesis WHERE lens = $1 AND municipality = $2", [target.lens, target.name]);
         if (parseInt(rows[0].count) > 0) {
            skip = true;
         }
      }
    } catch (e) {
      console.error(e);
    }
    
    if (skip) continue;

    await mineEventsForTarget(target.lens, target.name, target.province, target.queries);
    // Be polite to APIs
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log("✅ Miner execution completed.");
}

runMiner()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
