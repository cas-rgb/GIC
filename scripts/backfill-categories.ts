import { createRequire } from "module";
import { GoogleGenerativeAI } from "@google/generative-ai";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db/index");

const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const PROMPT = `
You are a civic intelligence analyst. 
Categorize each of these events into EXACTLY ONE of the following precise categories:
"Water"
"Electricity"
"Roads"
"Housing"
"Healthcare"
"Civil & Governance"
"Waste & Refuse"

Return a RAW JSON object mapping each ID to the selected category string. No markdown blocks, just a raw JSON string.
Example:
{
  "uuid-1": "Water",
  "uuid-2": "Civil & Governance"
}

EVENTS TO CATEGORIZE:
{EVENTS_JSON}
`;

function extractJson(text: string): Record<string, string> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return {};
  }
}

async function run() {
  console.log("Checking for uncategorized narratives...");
  const { rows } = await query("SELECT id, what_happened FROM ai_narrative_synthesis WHERE service_category IS NULL");
  
  if (rows.length === 0) {
    console.log("No records to backfill.");
    process.exit(0);
  }

  console.log(`Found ${rows.length} uncategorized records. Processing in 10x concurrent batches of 50...`);

  const processBatch = async (batch: any[], batchNum: number) => {
    const payload = batch.map(r => ({ id: r.id, event: r.what_happened }));

    const p = PROMPT.replace("{EVENTS_JSON}", JSON.stringify(payload, null, 2));
    
    return geminiFlash.generateContent(p).then(async (result) => {
      const output = result.response.text();
      const classifications = extractJson(output);
      
      let updatedCount = 0;
      for (const [id, category] of Object.entries(classifications)) {
        await query("UPDATE ai_narrative_synthesis SET service_category = $1 WHERE id = $2", [category, id]);
        updatedCount++;
      }
      console.log(` -> Updated ${updatedCount} records in batch ${batchNum}.`);
    }).catch(e => {
      console.error(`Batch ${batchNum} failed:`, e);
    });
  };

  const BATCH_SIZE = 50;
  const workers = [];
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    workers.push(processBatch(batch, batchNum));
    
    // Throttle to 5 concurrent promises to respect rate limits closely
    if (workers.length >= 5) {
      await Promise.all(workers);
      workers.length = 0; // clear queue
    }
  }
  
  // Await any remaining
  if (workers.length > 0) {
    await Promise.all(workers);
  }

  console.log("Backfill complete! All existing records categorized.");
  process.exit(0);
}

run();
