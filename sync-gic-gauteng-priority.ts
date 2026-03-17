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

async function runGautengPrioritySync() {
    loadEnv();
    
    // Dynamic import to ensure process.env is populated before Firebase/Orchestrator initializes
    const { GlobalDataOrchestrator } = await import("./src/services/data-orchestrator");
    const { SA_REGIONAL_REGISTRY } = await import("./src/data/regional-registry");
    
    console.log("--- GIC GAUTENG PRIORITY (UNDERDEVELOPED FOCUS) SYNC ---");
    
    const gauteng = SA_REGIONAL_REGISTRY.provinces.find(p => p.name === 'Gauteng');
    if (!gauteng) return;

    for (const muni of gauteng.municipalities) {
        console.log(`\n[MUNICIPALITY] ${muni.name}`);
        
        // Focus specifically on the wards (which we've named after high-priority townships)
        for (const ward of muni.wards) {
            console.log(`[DEEP JUSTICE DIVE] ${muni.name} -> ${ward}`);
            try {
                const results = await GlobalDataOrchestrator.performRegionalDeepDive(
                    'South Africa', 
                    'Gauteng', 
                    muni.name,
                    ward
                );
                console.log(`[SUCCESS] ${ward}. Signals: ${results.length}`);
            } catch (error) {
                console.error(`[FAILED] ${ward}:`, error);
            }
        }
    }
    
    console.log("\n--- GAUTENG PRIORITY SYNC COMPLETE ---");
}

runGautengPrioritySync().catch(console.error);
