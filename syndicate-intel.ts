import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function runSyndication() {
    console.log("--- GIC INTELLIGENCE SYNDICATION RUNNER ---");
    
    try {
        // Dynamic import to ensure process.env is ready for Firestore/Gemini
        const { CommunityIntelligenceSyndicator } = await import("./src/services/intelligence-syndicator");
        
        await CommunityIntelligenceSyndicator.syndicateAll();
        
        console.log("\n🚀 Syndication Complete. Executive Intelligence Layer is now live.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Syndication Runner Error:", error);
        process.exit(1);
    }
}

runSyndication().catch(console.error);
