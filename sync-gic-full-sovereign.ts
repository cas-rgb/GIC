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

async function runFullSovereignSync() {
    console.log("Check 1: Script started...");
    loadEnv();
    console.log("Check 2: Environment loaded. TAVILY_API_KEY exists:", !!process.env.TAVILY_API_KEY);
    
    try {
        console.log("Check 3: Attempting dynamic imports...");
        const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
        const { SA_REGIONAL_REGISTRY, SADC_REGIONAL_REGISTRY } = await import("./src/data/regional-registry");
        console.log("Check 4: Imports successful.");
        
        console.log("--- GIC FULL SOVEREIGN DATA INGESTION ---");
        console.log("Mission: Complete Infrastructure Intelligence Map (SA + SADC)");

        // 1. South Africa Full Sweep
        console.log("\n[PHASE 1] SOUTH AFRICA NATIONAL SWEEP");
        for (const province of SA_REGIONAL_REGISTRY.provinces) {
            console.log(`\n========================================`);
            console.log(`PROVINCE: ${province.name.toUpperCase()}`);
            console.log(`========================================`);
            
            for (const muni of province.municipalities) {
                try {
                    await GlobalDataOrchestrator.performRegionalDeepDive('South Africa', province.name, muni.name);
                    // Standard delay to ensure AI and search buffers clear
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } catch (error) {
                    console.error(`    [MUNI ERROR] ${muni.name}:`, error);
                }
            }
        }

        // 2. SADC Regional Sweep
        console.log("\n[PHASE 2] SADC REGIONAL SWEEP");
        type SADC_Country = 'Namibia' | 'Botswana' | 'Eswatini' | 'Lesotho';
        for (const [country, registry] of Object.entries(SADC_REGIONAL_REGISTRY)) {
            console.log(`\n========================================`);
            console.log(`COUNTRY: ${country.toUpperCase()}`);
            console.log(`========================================`);
            
            for (const province of registry.provinces) {
                for (const muni of province.municipalities) {
                    try {
                        await GlobalDataOrchestrator.performRegionalDeepDive(country as SADC_Country, province.name, muni.name);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } catch (error) {
                        console.error(`    [SADC ERROR] ${muni.name}:`, error);
                    }
                }
            }
        }
        
        console.log("\n--- FULL SOVEREIGN INGESTION COMPLETE ---");
    } catch (importError: any) {
        console.error("FATAL: Failed to initialize orchestration:", importError.message);
        if (importError.stack) console.error(importError.stack);
    }
}

runFullSovereignSync().catch(console.error);
