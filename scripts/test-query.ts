import { query } from "../src/lib/db";

async function run() {
  const res = await query("SELECT id, title, source_id, published_at FROM documents ORDER BY published_at DESC LIMIT 5");
  console.log("Recent Docs:", res.rows);
  process.exit();
}

run().catch(console.error);
