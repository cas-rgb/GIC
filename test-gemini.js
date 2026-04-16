require('@next/env').loadEnvConfig(process.cwd());
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.VERTEX_AI_API_KEY || "";
console.log(`Using API Key starting with: ${apiKey.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  console.log(`\nTesting Model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const start = Date.now();
    const result = await Promise.race([
        model.generateContent("Reply with exactly: 'API is operational'"),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout Exceeded (15s)")), 15000))
    ]);
    const text = result.response.text();
    console.log(`✅ Success in ${Date.now() - start}ms:`, text);
  } catch (e) {
    console.error(`❌ Failed:`, e.message || String(e));
  }
}

async function runTests() {
  await testModel("gemini-1.5-pro");
  await testModel("gemini-2.5-pro");
  console.log("\nDone testing.");
}

runTests();
