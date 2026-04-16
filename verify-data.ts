require('dotenv').config({ path: '.env.local' });
require('ts-node').register({ transpileOnly: true });

const { query, pool } = require('./src/lib/db/index');

async function checkData() {
  try {
     console.log("=========================================");
     console.log("       GIC PLATFORM DATA AUDIT           ");
     console.log("=========================================\n");

     const tables = ['documents', 'leader_mentions', 'municipal_leader_mentions', 'social_narratives', 'locations', 'fact_infrastructure_projects_daily'];
     
     for (const table of tables) {
         try {
           const res = await query(`SELECT COUNT(*) as count FROM ${table}`);
           console.log(`[${table.padEnd(35, ' ')}] : ${res.rows[0].count} rows`);
         } catch(e) {
           console.log(`[${table.padEnd(35, ' ')}] : ERROR (Does not exist or inaccessible)`);
         }
     }

     console.log("\n--- Breakdown by Province (leader_mentions) ---");
     try {
       const prov = await query(`SELECT province, count(*) as count FROM leader_mentions GROUP BY province`);
       prov.rows.forEach(r => console.log(`  ${r.province}: ${r.count}`));
     } catch(e) {}

     console.log("\n--- Breakdown by Province (social_narratives) ---");
     try {
       const narr = await query(`SELECT province, count(*) as count FROM social_narratives GROUP BY province`);
       narr.rows.forEach(r => console.log(`  ${r.province}: ${r.count}`));
     } catch(e) {}
     
     console.log("\n=========================================");
  } catch(e) {
     console.error(e);
  } finally {
     pool.end();
  }
}

checkData();
