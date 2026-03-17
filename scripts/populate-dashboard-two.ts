// scripts/populate-dashboard-two.ts
import { DashboardTwoPipeline } from '../src/services/dashboard-two-pipeline';

async function main() {
    const provinces = ["Gauteng", "Western Cape"];
    
    console.log("Starting Operational Risk Ingestion for Dashboard 2...");
    
    for (const province of provinces) {
        console.log(`\n--- Processing ${province} ---`);
        try {
            const results = await DashboardTwoPipeline.runOpsPipeline(province);
            console.log(`Completed ${province}: Found ${results.length} valid pressure cases.`);
        } catch (error) {
            console.error(`Failed to process ${province}:`, error);
        }
    }
    
    console.log("\nDashboard 2 Population Sequence Complete.");
}

// Note: This script is intended to be run via ts-node or similar in a server environment.
// For now, it serves as the orchestration logic for the DashboardTwoPipeline.
main();
