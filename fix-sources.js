require('@next/env').loadEnvConfig(process.cwd());
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

async function fix() {
  try {
    const res = await pool.query('SELECT id, name FROM sources');
    const sources = res.rows;
    console.log(`Found ${sources.length} sources.`);

    const realNames = ["eNCA", "News24", "Daily Maverick", "SABC News", "TimesLIVE", "Eyewitness News"];

    for (let i = 0; i < sources.length; i++) {
      if (sources[i].name === 'Demo Source' || sources[i].name.toLowerCase().includes('demo')) {
        const newName = realNames[i % realNames.length];
        await pool.query('UPDATE sources SET name = $1 WHERE id = $2', [newName, sources[i].id]);
        console.log(`Updated source ${sources[i].id} to ${newName}`);
      }
    }
  } catch (err) {
    console.error("SQL Error:", err.message);
  }
  process.exit(0);
}
fix();
