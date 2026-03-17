import * as fs from "fs";
import * as path from "path";

// Simple .env.local loader
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

async function runWikipediaSync() {
    loadEnv();
    
    const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
    const { SA_REGIONAL_REGISTRY, SADC_REGIONAL_REGISTRY } = await import("./src/data/regional-registry");
    
    console.log("--- GIC WIKIPEDIA BASELINE SYNC ---");
    console.log("Extracting foundational demographic and geographic context...");

    // 1. South Africa
    for (const province of SA_REGIONAL_REGISTRY.provinces) {
        console.log(`\nProvince: ${province.name}`);
        for (const muni of province.municipalities) {
            console.log(`  > Wikipedia Ingestion: ${muni.name}`);
            try {
                // @ts-ignore
                await GlobalDataOrchestrator.performRegionalDeepDive('South Africa', province.name, muni.name);
                await new Promise(resolve => setTimeout(resolve, 3000));
            } catch (error) {
                console.error(`    [ERROR] ${muni.name}:`, error);
            }
        }
    }

    // 2. SADC
    for (const [country, registry] of Object.entries(SADC_REGIONAL_REGISTRY)) {
        console.log(`\nCountry: ${country}`);
        // @ts-ignore
        for (const province of registry.provinces) {
            for (const muni of province.municipalities) {
                console.log(`  > Wikipedia Ingestion: ${muni.name} (${province.name})`);
                try {
                    // @ts-ignore
                    await GlobalDataOrchestrator.performRegionalDeepDive(country, province.name, muni.name);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                } catch (error) {
                    console.error(`    [ERROR] ${muni.name}:`, error);
                }
            }
        }
    }
    
    console.log("\n--- WIKIPEDIA SYNC COMPLETE ---");
}

runWikipediaSync().catch(console.error);
