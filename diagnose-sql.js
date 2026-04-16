require('@next/env').loadEnvConfig(process.cwd());
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

async function test() {
  try {
    const res = await pool.query(`
      SELECT d.title, d.published_at, d.url, s.name as source_name 
      FROM documents d 
      LEFT JOIN sources s ON d.source_id = s.id 
      ORDER BY d.published_at DESC 
      LIMIT 15
    `);
    
    const realDocs = res.rows || [];
    const youtubeDocs = realDocs.slice(0, 4);
    const articleDocs = realDocs.slice(4, 8);
    const velocityDocs = realDocs.slice(8, 13);
    
    console.log("TOTAL ROWS:", realDocs.length);
    console.log("articleDocs LENGTH:", articleDocs.length);
    
    const trendingArticles = articleDocs.map((d) => ({
      headline: d.title,
      source: d.source_name || "Local Press",
      url: d.url || `https://www.google.com/search?q=${encodeURIComponent(d.title)}`,
      engagement: Math.floor(Math.random() * 5000) + 500
    }));
    
    console.log("TRENDING ARTICLES PAYLOAD:", JSON.stringify(trendingArticles, null, 2));

  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit(0);
}
test();
