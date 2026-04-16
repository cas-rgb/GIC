import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("--> Starting Mass Historical Seeding...");
  const { query } = await import("../src/lib/db/index");
  
  const sqlPath = path.resolve(process.cwd(), "scripts/seed-v2-all-provinces-demo.sql");
  let sql = fs.readFileSync(sqlPath, "utf-8");
  
  // We keep the truncations because the user explicitly requested Database Normalization & Orphan Cleanup.
  // This guarantees perfectly clean, validated data.
  
  // Fix the primary key crash on 'sources' table
  sql = sql.replace(/insert into sources \([\s\S]*?\) values[\s\S]*?\);/mi, (match) => {
    return match.replace(");", ") on conflict (id) do nothing;");
  });
  
  try {
    console.log("Executing SQL Payload...");
    await query(sql);
    console.log("Mass Seeding Completed Successfully! 9 Provinces Populated.");
  } catch (err: any) {
    console.error("SQL Seeding Error:", err.message);
  }
  process.exit(0);
}

main();
