const { initializeApp } = require("firebase/app");
const { getFirestore, collection, doc, setDoc, Timestamp } = require("firebase/firestore");
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

const TAVILY_API_KEY = env.TAVILY_API_KEY;
const GEMINI_API_KEY = env.VERTEX_AI_API_KEY;

const ALLOWED_TOPICS = [
    "Water Infrastructure", "Electricity Supply", "Roads and Transport",
    "Healthcare", "Housing", "Education", "Crime and Safety",
    "Waste Management", "Local Governance", "Economic Development",
    "Social Distress", "Public Transport", "Environmental Risk",
    "Provincial Infrastructure", "Other"
];

async function deepResearch(query) {
    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            api_key: TAVILY_API_KEY,
            query: query,
            search_depth: "advanced",
            max_results: 8
        })
    });
    return response.json();
}

async function geminiFlash(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
    }
    return "";
}

function extractJsonObject(text) {
    try {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}') + 1;
        if (start === -1 || end === 0) return null;
        return JSON.parse(text.substring(start, end));
    } catch (e) { return null; }
}

function sanitizeId(id) {
    return id.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
}

async function runPipeline(province) {
    console.log(`\n--- Starting Narrative-Driven Pipeline for: ${province} ---`);
    
    // Strategic Query Sets
    let queries = [
        `${province} service delivery complaints water electricity`,
        `${province} provincial budget priorities infrastructure`,
    ];

    if (province === 'Western Cape') {
        queries = [
            `Cape Town housing affordability Sea Point Green Point City Bowl rental prices`,
            `Khayelitsha Delft Mitchells Plain service delivery sanitation waste management`,
            `Cape Flats gang violence safe policing communities community reporting`,
            `Cape Town government owned land sale affordable housing urban planning debate`,
            `Western Cape cost of living rental increases versus earning power`,
            `Western Cape provincial budget 2024 infrastructure transport sanitation`
        ];
    } else if (province === 'Gauteng') {
        queries = [
            `Gauteng electricity supply load shedding impact businesses JSE`,
            `Gauteng water crisis Rand Water supply disruptions residents protesting`,
            `Gauteng public transport taxi violence Rea Vaya service reliability`,
            `Gauteng provincial budget 2024 healthcare education infrastructure priorities`
        ];
    }

    for (const query of queries) {
        console.log(`[TAVILY] Querying Strategic Theme: ${query}`);
        const results = await deepResearch(query);
        if (!results.results) continue;

        for (const res of results.results) {
            console.log(`[AI] Processing Signal: ${res.title}`);
            
            const issuePrompt = `
            Analyze this signal for the GIC Executive Intelligence Platform.
            
            PROVINCE: ${province}
            TITLE: ${res.title}
            CONTENT: ${res.content}
            URL: ${res.url}

            You MUST extract a high-fidelity intelligence context. 
            Identify if this is a "Local Affordability vs Global Demand" issue, a "Service Delivery Reliability" issue, or a "Community Safety" issue.
            
            Return JSON:
            {
                "primary_topic": "One of: ${ALLOWED_TOPICS.join(', ')}",
                "sentiment": "Positive|Neutral|Negative",
                "urgency": "Low|Medium|High",
                "municipality": "Specific name if found, else null",
                "evidence_snippet": "A concise, narrative 1-2 sentence briefing that explains why this signal (the 'ground truth') matters to provincial leadership. Connect the dots between the event and the impact on residents.",
                "confidence": number (0.0 to 1.0)
            }`;
            
            const issueText = await geminiFlash(issuePrompt);
            const classification = extractJsonObject(issueText);

            if (classification) {
                const id = sanitizeId(`issue-${Buffer.from(res.url).toString('base64').substring(0, 20)}`);
                await setDoc(doc(db, "community_issue", id), {
                    ...classification,
                    id,
                    province: province,
                    tavily_result_id: res.url,
                    source_title: res.title,
                    status: 'active',
                    country: 'South Africa',
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now(),
                    citizen_concern_indicator: true,
                    government_priority_indicator: res.content.toLowerCase().includes('budget') || res.content.toLowerCase().includes('policy')
                });
                console.log(`[SUCCESS] Ingested Narrative Signal: ${classification.primary_topic} - ${classification.municipality || 'Provincial'}`);
            }
        }
    }
}

async function main() {
    const provinces = ['Western Cape', 'Gauteng', 'North West', 'Mpumalanga', 'Eastern Cape'];
    // We prioritize Western Cape and Gauteng for deep narrative grounding
    for (const province of provinces) {
        await runPipeline(province);
    }
    console.log("\nNarrative-Driven Multi-Region Population Complete.");
    process.exit(0);
}

main().catch(console.error);
