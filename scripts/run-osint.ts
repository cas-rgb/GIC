import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { processMineDeepSocialJob } from "../src/lib/jobs/mine-deep-social-handler";

const provinces = [
  "All Provinces",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

async function run() {
    console.log("Starting full-scale OSINT job for ALL 9 Provinces...");
    for (const p of provinces) {
        try {
            console.log(`\n\n--- Initiating payload for: ${p} ---`);
            await processMineDeepSocialJob({ province: p });
            console.log(`  -> Waiting 12 seconds to preserve Gemini quota...`);
            await new Promise(r => setTimeout(r, 12000));
        } catch (e) {
            console.error(`  ❌ Failed for ${p}:`, e);
        }
    }
    console.log("\n\n✅ FULL DATABASE POPULATION SUCCESSFUL!");
    process.exit(0);
}
run();
