require('dotenv').config({ path: '.env.local' });
// Register ts-node to compile typescript files automatically
require('ts-node').register({ transpileOnly: true });

const { processMineDeepSocialJob } = require('./src/lib/jobs/mine-deep-social-handler.ts');
const { query, pool } = require('./src/lib/db/index');

async function trigger() {
  try {
     console.log("Starting OSINT manual trigger for Gauteng...");
     await processMineDeepSocialJob({ province: "Gauteng" });
     const check = await query(`SELECT * FROM leader_mentions WHERE province='Gauteng' ORDER BY created_at DESC LIMIT 1`);
     console.log("Database Extraction Verification:", check.rows[0]);
  } catch(e) {
     console.error(e);
  } finally {
     pool.end();
  }
}

trigger();
