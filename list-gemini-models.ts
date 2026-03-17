
import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function listModels() {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
    
    console.log("--- Testing Identified Gemini 3 models (2026 Baseline) ---");
    try {
        const commonModels = [
            "gemini-3.1-pro-preview",
            "gemini-3-flash-preview",
            "gemini-3.1-flash-lite-preview",
            "gemini-3.1-flash-preview",
            "gemini-1.5-flash-latest" // Re-testing just in case
        ];
        
        for (const modelName of commonModels) {
            console.log(`Testing alias: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("ping");
                console.log(`  [OK] ${modelName} is available.`);
            } catch (e: any) {
                console.log(`  [FAIL] ${modelName}: STATUS ${e.status || 'Error'} - ${e.message}`);
            }
        }
    } catch (e) {
        console.error("Critical error in listing script:", e);
    }
}

listModels();
