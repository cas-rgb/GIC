import { GlobalDataOrchestrator } from "./src/services/data-orchestrator";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runBitByBit() {
    console.log("--- GIC BIT-BY-BIT POPULATION: GAUTENG ---");
    const targets = [
        { country: "South Africa", province: "Gauteng", municipality: "City of Tshwane" },
        { country: "South Africa", province: "Gauteng", municipality: "Ekurhuleni" }
    ] as const;
    
    for (const target of targets) {
        console.log(`Deep Dive: ${target.municipality} (${target.country})...`);
        const results = await GlobalDataOrchestrator.performRegionalDeepDive(target.country, target.province, target.municipality);
        console.log(`Completed ${target.municipality}. Ingested ${results.length} raw records.`);
    }
    console.log("--- SYNC COMPLETE ---");
}

runBitByBit();
