const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, "");
    }
});

const genAI = new GoogleGenerativeAI(env.NEXT_PUBLIC_VERTEX_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
    try {
        const result = await model.generateContent("Hello, are you active?");
        console.log("SUCCESS:", result.response.text());
    } catch (err) {
        console.log("FAILED:", err.message);
    }
}
test();
