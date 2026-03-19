import { query } from "../src/lib/db";

async function main() {
  console.log("Checking ai_narrative_synthesis...");
  const res = await query(`SELECT lens, target_attribute, target_value, COUNT(*) as count FROM ai_narrative_synthesis GROUP BY lens, target_attribute, target_value ORDER BY lens, count DESC`);
  console.log(res.rows);
  process.exit(0);
}

main().catch(console.error);
