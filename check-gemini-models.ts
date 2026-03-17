
import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function checkModels() {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
    
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-flash"];
    
    for (const modelName of modelsToTry) {
        console.log(`Trying model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`  [SUCCESS] ${modelName} works! Response: ${result.response.text()}`);
            break; // Stop at first working model
        } catch (e: any) {
            console.error(`  [FAILED] ${modelName}: STATUS ${e.status} - ${e.message}`);
        }
    }
}

checkModels();
