import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const PROVINCES = [
  "All Provinces",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

async function runMiner() {
  const { query } = require("../src/lib/db");
  console.log("🚀 Queuing Deep Social & Media Miner Jobs...");
  
  for (const province of PROVINCES) {
    try {
      await query(
        `
          insert into job_queue (job_type, payload)
          values ('mine_deep_social', $1::jsonb)
        `,
        [JSON.stringify({ province })]
      );
      console.log(`  ✅ Enqueued province: ${province}`);
    } catch (e) {
       console.error(`  ❌ Failed to enqueue ${province}`, e);
    }
  }
  
  console.log("✅ All Deep Social jobs successfully mapped to the Postgres Queue.");
  process.exit(0);
}

runMiner().catch((e) => {
  console.error("Fatal Error:", e);
  process.exit(1);
});
