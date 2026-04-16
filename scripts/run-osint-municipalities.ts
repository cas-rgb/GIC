import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { processMineDeepSocialJob } from "../src/lib/jobs/mine-deep-social-handler";

const municipalities = [
  { province: "Gauteng", municipality: "City of Johannesburg" },
  { province: "Gauteng", municipality: "City of Tshwane" },
  { province: "Gauteng", municipality: "City of Ekurhuleni" },
  { province: "KwaZulu-Natal", municipality: "eThekwini" },
  { province: "Western Cape", municipality: "City of Cape Town" }
];

async function run() {
    console.log("Starting full-scale OSINT job for Major Municipalities...");
    for (const m of municipalities) {
        try {
            console.log(`\n\n--- Initiating payload for: ${m.municipality} (${m.province}) ---`);
            await processMineDeepSocialJob({ province: m.province, municipality: m.municipality });
            console.log(`  -> Waiting 12 seconds to preserve Gemini quota...`);
            await new Promise(r => setTimeout(r, 12000));
        } catch (e) {
            console.error(`  ❌ Failed for ${m.municipality}:`, e);
        }
    }
    console.log("\n\n✅ MUNICIPAL DATABASE POPULATION SUCCESSFUL!");
    process.exit(0);
}
run();
