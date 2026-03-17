import { GlobalDataOrchestrator } from "./src/services/data-orchestrator";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runInception() {
    console.log("--- GIC GRAND INCEPTION ---");
    const targets = [
        { country: "South Africa", province: "Gauteng", municipality: "City of Johannesburg" },
        { country: "South Africa", province: "Western Cape", municipality: "City of Cape Town" },
        { country: "Namibia", province: "Khomas", municipality: "Windhoek" },
        { country: "Botswana", province: "South-East", municipality: "Gaborone" },
        { country: "Lesotho", province: "Maseru", municipality: "Maseru" }
    ] as const;

    for (const target of targets) {
        console.log(`Deep Dive: ${target.municipality} (${target.country})...`);
        await GlobalDataOrchestrator.performRegionalDeepDive(target.country, target.province, target.municipality);
    }
    console.log("--- INCEPTION COMPLETE ---");
}

runInception();
