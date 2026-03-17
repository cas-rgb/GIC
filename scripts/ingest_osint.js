const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } = require("firebase/firestore");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { tavily } = require("@tavily/core");
const fs = require("fs");
const path = require("path");

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) {
        env[key.trim()] = value.trim().replace(/"/g, "");
    }
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const genAI = new GoogleGenerativeAI(env.NEXT_PUBLIC_VERTEX_AI_API_KEY);
const tClient = tavily({ apiKey: env.NEXT_PUBLIC_TAVILY_API_KEY });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const premiers = [
    { name: "Oscar Mabuyane", prov: "Eastern Cape" },
    { name: "Mandla Ndlovu", prov: "Mpumalanga" },
    { name: "Zamani Saul", prov: "Northern Cape" },
    { name: "Alan Winde", prov: "Western Cape" }
];

const platforms = [
    { name: "Twitter", site: "twitter.com" },
    { name: "Facebook", site: "facebook.com" },
    { name: "Instagram", site: "instagram.com" },
    { name: "TikTok", site: "tiktok.com" }
];

async function runIngestion() {
    console.log(`Starting Social OSINT Ingestion for 4 Provinces...`);
    let totalSignals = 0;

    for (const premier of premiers) {
        for (const platform of platforms) {
            console.log(`\nSearching ${platform.name} for ${premier.name} (${premier.prov})...`);

            try {
                // 1. Search Tavily for Social Media Mentions
                const query = `site:${platform.site} "${premier.name}" ${premier.prov} infrastructure water roads services sentiment`;
                const searchRes = await tClient.search(query, {
                    searchDepth: "advanced",
                    maxResults: 10
                });

                if (!searchRes.results || searchRes.results.length === 0) {
                    console.log(`No results for ${premier.name} on ${platform.name}.`);
                    continue;
                }

                const context = searchRes.results.map(r => `SOURCE: ${r.url}\nTITLE: ${r.title}\nCONTENT: ${r.content}`).join("\n---\n");

                // 2. AI Extract
                const prompt = `
                    Extract infrastructure-related signals from the following social media data for the province of ${premier.prov} and Premier ${premier.name}.
                    Focus on: Water shortages, Road conditions, Healthcare, Urban development, Housing.
                    
                    Identify REAL data points: issues, user sentiment, and specific mentions.
                    You MUST cite the SOURCE URL from the context for every signal.
                    
                    Produce up to 20 structured signals for this province-platform intersection to help reach our 500 total goal.
                    
                    Return JSON array:
                    [{
                        "community": "${premier.prov}",
                        "premier": "${premier.name}",
                        "platform": "${platform.name}",
                        "issue": "Specific challenge",
                        "sentiment": "positive|neutral|negative",
                        "urgency": number (1-100),
                        "evidence": "Brief descriptive evidence (quote or summary)",
                        "source": "URL from context",
                        "category": "Civil|Roads|Health|Planning|Structural",
                        "timestamp": "${new Date().toISOString()}"
                    }]

                    CONTEXT:
                    ${context}
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);

                if (jsonMatch) {
                    const signals = JSON.parse(jsonMatch[0]);

                    // 3. Save to Firestore
                    for (const signal of signals) {
                        const signalId = `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                        await setDoc(doc(db, "community_signals", signalId), {
                            ...signal,
                            createdAt: serverTimestamp()
                        });
                    }

                    totalSignals += signals.length;
                    console.log(`Successfully ingested ${signals.length} signals. Total now: ${totalSignals}`);
                }

                await new Promise(r => setTimeout(r, 1000));

            } catch (err) {
                console.error(`Error processing ${premier.name} on ${platform.name}:`, err.message);
                if (err.message.includes("Generative Language API")) {
                    console.log("CRITICAL: API still disabled. Please enable it in Cloud Console.");
                    process.exit(1);
                }
            }
        }
    }

    console.log(`\nMass Ingestion Complete. Total signals: ${totalSignals}`);
    process.exit(0);
}

runIngestion().catch(console.error);
