require('dotenv').config({ path: '.env.local' });
require('ts-node').register({ transpileOnly: true });

const { processMineDeepSocialJob } = require('./src/lib/jobs/mine-deep-social-handler.ts');
const { pool } = require('./src/lib/db/index');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function seedData() {
  const targets = [
    { province: "Gauteng", municipality: "City of Johannesburg" },
    { province: "Gauteng", municipality: "City of Tshwane" },
    { province: "Gauteng", municipality: "City of Ekurhuleni" },
    { province: "KwaZulu-Natal", municipality: "eThekwini" },
    { province: "Western Cape", municipality: "City of Cape Town" },
    { province: "Gauteng" },
    { province: "Western Cape" },
    { province: "KwaZulu-Natal" },
    { province: "Eastern Cape" },
    { province: "Free State" },
    { province: "Limpopo" },
    { province: "Mpumalanga" },
    { province: "North West" },
    { province: "Northern Cape" },
    { province: "All Provinces" }
  ];

  console.log(`Starting slow background OSINT extraction for ${targets.length} targets...`);

  for (let i = 0; i < targets.length; i++) {
     console.log(`\n[${i+1}/${targets.length}] Triggering extraction for ${targets[i].province} ${targets[i].municipality || ''}...`);
     try {
       await processMineDeepSocialJob(targets[i]);
     } catch(e) {
       console.error(`Failed extraction for target ${i+1}:`, e.message);
     }
     
     if (i < targets.length - 1) {
       console.log("Waiting 13 seconds to respect Gemini 5 req/min rate limit...");
       await sleep(13000);
     }
  }

  console.log("\nMass Ingestion Complete!");
  pool.end();
}

seedData();
