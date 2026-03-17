import { GlobalDataOrchestrator } from "./src/services/data-orchestrator";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runWave2() {
    console.log("--- GIC WAVE 2 ORCHESTRATION ---");
    const targets = [
        { country: "South Africa", province: "Western Cape", municipality: "City of Cape Town" },
        { country: "South Africa", province: "KwaZulu-Natal", municipality: "eThekwini" },
        { country: "Namibia", province: "Khomas", municipality: "Windhoek" },
        { country: "Botswana", province: "South-East", municipality: "Gaborone" }
    ] as const;
    
    for (const target of targets) {
        console.log(`Deep Dive: ${target.municipality} (${target.country})...`);
        const results = await GlobalDataOrchestrator.performRegionalDeepDive(target.country, target.province, target.municipality);
        console.log(`Completed ${target.municipality}. Records: ${results.length}`);
    }
    console.log("--- WAVE 2 COMPLETE ---");
}

runWave2();
