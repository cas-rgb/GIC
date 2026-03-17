import * as fs from "fs";
import * as path from "path";

// Simple .env.local loader to avoid 'dotenv' dependency
function loadEnv() {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join("=").trim();
            }
        });
    }
}

async function runSADCSync() {
    loadEnv();
    
    // Dynamic import to ensure process.env is populated before GlobalDataOrchestrator initializes
    const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
    
    console.log("--- GIC SADC & REGIONAL EXPANSION SYNC ---");
    
    const targets = [
        { country: "South Africa", province: "Western Cape", municipality: "City of Cape Town" },
        { country: "South Africa", province: "KwaZulu-Natal", municipality: "eThekwini" },
        { country: "Namibia", province: "Khomas", municipality: "Windhoek" },
        { country: "Namibia", province: "Erongo", municipality: "Walvis Bay" },
        { country: "Botswana", province: "South-East", municipality: "Gaborone" },
        { country: "Botswana", province: "Francistown", municipality: "Francistown City" },
        { country: "Lesotho", province: "Maseru", municipality: "Maseru" },
        { country: "Eswatini", province: "Hhohho", municipality: "Mbabane" },
        { country: "Eswatini", province: "Manzini", municipality: "Manzini" }
    ] as const;
    
    for (const target of targets) {
        console.log(`\n[SYNCING] ${target.municipality}, ${target.province}, ${target.country}...`);
        try {
            // @ts-ignore
            const results = await GlobalDataOrchestrator.performRegionalDeepDive(
                target.country as any, 
                target.province, 
                target.municipality
            );
            console.log(`[SUCCESS] ${target.municipality}. Records Ingested: ${results.length}`);
        } catch (error) {
            console.error(`[FAILED] ${target.municipality}:`, error);
        }
    }
    
    console.log("\n--- SADC EXPANSION COMPLETE ---");
}

runSADCSync().catch(console.error);
