require('@next/env').loadEnvConfig(process.cwd());
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

async function run() {
  try {
    console.log("Cleaning up truncated fallback documents...");
    // Delete documents that have weird truncations from the fallback
    const res = await pool.query(`
      DELETE FROM documents 
      WHERE title LIKE '%water ma' 
         OR title LIKE '%water c' 
         OR title LIKE '%Wikipedia%'
    `);
    console.log(`Deleted ${res.rowCount} messy fallback documents.`);
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit(0);
}
run();
