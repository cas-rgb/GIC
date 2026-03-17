const fs = require("fs");
const path = require("path");

// Environment Setup
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const trimmed = line.replace(/\r/g, '').trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...valueParts] = trimmed.split("=");
    if (key && valueParts.length > 0) {
        let value = valueParts.join("=").trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        env[key.trim()] = value;
    }
});

const TAVILY_API_KEY = env.TAVILY_API_KEY;
const GEMINI_API_KEY = env.VERTEX_AI_API_KEY;

async function testAll() {
    console.log("Testing Tavily...");
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ api_key: TAVILY_API_KEY, query: "Gauteng news", max_results: 1 })
        });
        const data = await response.json();
        console.log("Tavily Success:", data.results ? data.results.length : 0);
    } catch (e) {
        console.error("Tavily Failed:", e.message);
    }

    console.log("Testing Gemini...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        const data = await response.json();
        console.log("Gemini Success:", data.candidates ? "Yes" : "No");
    } catch (e) {
        console.error("Gemini Failed:", e.message);
    }
}

testAll();
