import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { query } from "./src/lib/db/index";

async function test() {
  try {
    console.log("Testing PostgreSQL query from API Route...");
    const docsRes = await query(`
      SELECT d.title, d.published_at, d.url, s.name as source_name 
      FROM documents d 
      LEFT JOIN sources s ON d.source_id = s.id 
      ORDER BY d.published_at DESC 
      LIMIT 15
    `);
    console.log(`Query succeeded! Found ${docsRes.rows.length} rows.`);
    console.log(docsRes.rows.slice(0, 3));
  } catch (e: any) {
    console.error("Query Error:", e.message);
  }
  process.exit(0);
}
test();
