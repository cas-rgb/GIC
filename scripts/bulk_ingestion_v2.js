const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");
const { VertexAI } = require("@google-cloud/vertexai");
const { tavily } = require("@tavily/core");
const fs = require("fs");
const path = require("path");

// Environment Setup
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

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, location: 'us-central1' });
const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const tClient = tavily({ apiKey: env.NEXT_PUBLIC_TAVILY_API_KEY });

// Target Communities
const targetCommunities = [
    { name: "Nelson Mandela Bay", muni: "NMA Metro", prov: "Eastern Cape" },
    { name: "Buffalo City", muni: "BCM Metro", prov: "Eastern Cape" },
    { name: "Nkangala District", muni: "Nkangala District", prov: "Mpumalanga" },
    { name: "Sol Plaatje", muni: "Kimberley Local", prov: "Northern Cape" },
    { name: "City of Cape Town", muni: "CCT Metro", prov: "Western Cape" },
    { name: "Saldanha Bay", muni: "West Coast District", prov: "Western Cape" }
];

const serviceLines = ["Water/Sewerage", "Roads", "Health", "Town Planning", "Structural"];

// Template Query Generators
const getCoreQueries = (community, muni) => [
    `("${community}" OR "${muni}") AND (water OR sewerage OR sewage OR "burst pipe" OR "water outage" OR "no water" OR sanitation OR potholes OR roads OR clinic OR hospital OR housing OR structural)`,
    `("${community}" OR "${muni}") AND ("service delivery" OR "service-delivery" OR "community protest" OR protest OR march OR shutdown OR unrest)`,
    `("${community}") AND (today OR this week OR "last night" OR yesterday) AND (water OR sewage OR potholes OR protest OR clinic)`
];

const getServiceQueries = (community, muni, service) => {
    switch (service) {
        case "Water/Sewerage":
            return [
                `("${community}" OR "${muni}") AND ("no water" OR "water outage" OR "water supply" OR "water cuts" OR "water tanker")`,
                `("${community}" OR "${muni}") AND (sewerage OR sewage OR sanitation OR "sewage spill" OR "blocked drain")`
            ];
        case "Roads":
            return [
                `("${community}" OR "${muni}") AND (pothole OR potholes OR "road damage" OR "road collapse" OR sinkhole)`,
                `("${community}" OR "${muni}") AND ("roadworks" OR "road maintenance" OR resurfacing OR detour)`
            ];
        case "Health":
            return [
                `("${community}" OR "${muni}") AND (clinic OR hospital OR "health facility" OR "mobile clinic")`,
                `("${community}" OR "${muni}") AND ("medicine shortage" OR "staff shortage" OR overcrowding)`
            ];
        case "Town Planning":
            return [
                `("${community}" OR "${muni}") AND ("town planning" OR rezoning OR zoning OR "land use")`,
                `("${community}" OR "${muni}") AND ("informal settlement" OR "land invasion" OR "illegal occupation")`
            ];
        case "Structural":
            return [
                `("${community}" OR "${muni}") AND ("structural" OR "structural damage" OR "building collapse" OR "unsafe building")`,
                `("${community}" OR "${muni}") AND ("community hall" OR "school building" OR "facility upgrade")`
            ];
        default: return [];
    }
};

const getSocialConstraint = () => "(site:twitter.com OR site:instagram.com OR site:tiktok.com OR site:linkedin.com OR site:facebook.com)";

async function fetchAndNormalize(query, community, type) {
    console.log(`Executing Query [${type}]: ${query}`);
    try {
        const searchRes = await tClient.search(query, {
            searchDepth: "advanced",
            maxResults: 10
        });

        if (!searchRes.results || searchRes.results.length === 0) return 0;

        const context = searchRes.results.map(r => `URL: ${r.url}\nTITLE: ${r.title}\nCONTENT: ${r.content}`).join("\n---\n");

        const prompt = `
            Task: Extract and normalize real-world South African service delivery signals from the provided Tavily search results.
            Target Location: ${community}
            
            Strict Rules:
            1. NO SYNTHETIC DATA. If a result is irrelevant or generic, ignore it.
            2. Prioritize individual voices, ordinary people, and community groups.
            3. Normalize into a clean JSON array of objects.
            4. If the source is a social media platform (X, Instagram, TikTok, LinkedIn, Facebook), label source_type as "social".
            5. Sentiment must be "positive", "neutral", or "negative".
            
            JSON Format Requirements per object:
            {
                "url": "full source url",
                "title": "clean title or first 50 chars of post",
                "published_date": "YYYY-MM-DD if available, else null",
                "source_name": "name of site or platform",
                "source_type": "local news | regional news | NGO | municipal | social",
                "excerpt": "concise accurate summary of the specific claim/issue",
                "matched_keywords": ["water", "protest", etc],
                "detected_location": "${community}",
                "detected_topic": "specific issue category",
                "sentiment": "sentiment level"
            }

            CONTEXT:
            ${context}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
            const signals = JSON.parse(jsonMatch[0]);
            for (const sig of signals) {
                const signalId = `scaled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await setDoc(doc(db, "community_signals", signalId), {
                    ...sig,
                    community: community,
                    createdAt: serverTimestamp()
                });
            }
            return signals.length;
        }
    } catch (err) {
        console.error(`Error processing query:`, err.message);
    }
    return 0;
}

async function runBulkIngestion() {
    console.log("Starting Phase 16: Bulk OSINT Scaling (Vertex AI)...");
    let totalIngested = 0;

    for (const comm of targetCommunities) {
        console.log(`\n--- Processing Community: ${comm.name} ---`);

        // 1. Core Social Pulse
        const coreQueries = getCoreQueries(comm.name, comm.muni);
        for (const q of coreQueries) {
            const socialQuery = `${q} ${getSocialConstraint()}`;
            totalIngested += await fetchAndNormalize(socialQuery, comm.name, "Core Social");
        }

        // 2. Service Line Precision
        for (const service of serviceLines) {
            const serviceQueries = getServiceQueries(comm.name, comm.muni, service);
            for (const q of serviceQueries) {
                totalIngested += await fetchAndNormalize(q, comm.name, `Service: ${service}`);
            }
        }

        // 3. Stakeholder Discovery
        const stakeholderQuery = `("${comm.name}" OR "${comm.muni}") AND ("ward councillor" OR NGO OR "residents association" OR journalist)`;
        totalIngested += await fetchAndNormalize(stakeholderQuery, comm.name, "Stakeholders");

        console.log(`Current Total Ingested: ${totalIngested}`);
        if (totalIngested >= 1100) break;

        // Pause to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\nBulk Ingestion Complete. Total new signals: ${totalIngested}`);
    process.exit(0);
}

runBulkIngestion().catch(console.error);
