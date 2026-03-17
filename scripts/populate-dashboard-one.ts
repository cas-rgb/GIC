import { DashboardOnePipeline } from '../src/services/dashboard-one-pipeline';
import { loadEnv } from './load-env-cli';
import { db } from '../src/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

// Start
console.log("[DEBUG] Script started.");

// Standard environment loader
const envLoaded = loadEnv();
console.log(`[DEBUG] Env Loaded: ${envLoaded}`);
console.log(`[DEBUG] TAVILY_API_KEY: ${process.env.TAVILY_API_KEY ? 'Present' : 'MISSING'}`);
console.log(`[DEBUG] FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

async function main() {
    const provinces = ['Western Cape', 'North West', 'Mpumalanga', 'Eastern Cape', 'Gauteng'];
    
    // Check initial counts
    try {
        const count = await getCountFromServer(collection(db, "community_issue"));
        console.log(`[DEBUG] Initial community_issue count: ${count.data().count}`);
    } catch (e: any) {
        console.error(`[DEBUG] Error checking initial count: ${e.message}`);
    }

    for (const province of provinces) {
        console.log(`\n[PIPELINE] >>> Processing signals for: ${province}`);
        try {
            await DashboardOnePipeline.runFullPipeline(province);
            console.log(`[PIPELINE] <<< Finished ${province}.`);
        } catch (error: any) {
            console.error(`[PIPELINE] !!! Fatal Error for ${province}:`, error.message);
            if (error.stack) console.error(error.stack);
        }
    }
    
    // Check final counts
    try {
        const count = await getCountFromServer(collection(db, "community_issue"));
        console.log(`\n[DEBUG] Final community_issue count: ${count.data().count}`);
    } catch (e: any) {
        console.error(`[DEBUG] Error checking final count: ${e.message}`);
    }

    console.log("[DEBUG] Script finished.");
    process.exit(0);
}

main().catch(e => {
    console.error("[DEBUG] Unhandled Promise Rejection:", e);
    process.exit(1);
});
