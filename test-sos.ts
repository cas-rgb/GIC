import { ScoringEngine } from "./src/services/scoring-engine";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testScoring() {
    console.log("--- GIC SOS ENGINE TEST ---");
    try {
        const result = await ScoringEngine.calculateSOS('South Africa', 'Gauteng', 'City of Johannesburg');
        console.log("SOS Result for Johannesburg:", JSON.stringify(result, null, 2));
        
        const provincial = await ScoringEngine.calculateSOS('South Africa', 'Gauteng');
        console.log("SOS Result for Gauteng (Province):", JSON.stringify(provincial, null, 2));
        
    } catch (error) {
        console.error("Scoring Test failed:", error);
    }
}

testScoring();
