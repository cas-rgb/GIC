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

async function runContinentalSync() {
    loadEnv();
    
    // Dynamic import to ensure process.env is populated before GlobalDataOrchestrator initializes
    const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
    
    console.log("--- GIC FULL CONTINENTAL EXPANSION SYNC ---");
    
    const targets = [
        // SOUTH AFRICA - PROVINCIAL CAPITALS & INDUSTRIAL HUBS
        { country: "South Africa", province: "Limpopo", municipality: "Polokwane" },
        { country: "South Africa", province: "Mpumalanga", municipality: "Mbombela" },
        { country: "South Africa", province: "North West", municipality: "Rustenburg" },
        { country: "South Africa", province: "Free State", municipality: "Mangaung" },
        { country: "South Africa", province: "Northern Cape", municipality: "Sol Plaatje" },
        { country: "South Africa", province: "Eastern Cape", municipality: "Nelson Mandela Bay" },
        { country: "South Africa", province: "Eastern Cape", municipality: "Buffalo City" },
        { country: "South Africa", province: "KwaZulu-Natal", municipality: "Msunduzi" },
        
        // SADC - SECONDARY ECONOMIC HUBS
        { country: "Namibia", province: "Erongo", municipality: "Walvis Bay" },
        { country: "Botswana", province: "Francistown", municipality: "Francistown City" },
        { country: "Eswatini", province: "Manzini", municipality: "Manzini" }
    ] as const;
    
    for (const target of targets) {
        console.log(`\n[EXPANDING] ${target.municipality}, ${target.province}, ${target.country}...`);
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
    
    console.log("\n--- CONTINENTAL EXPANSION COMPLETE ---");
}

runContinentalSync().catch(console.error);
