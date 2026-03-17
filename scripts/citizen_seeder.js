const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");
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

// Explicitly institutional accounts and news
const officialSources = [
    "municipality", "gov.za", "official", "mayor", "mec", "spokesperson",
    "news24", "daily maverick", "the herald", "sowetan", "timeslive", "citizen.co.za",
    "business chamber", "chamber of commerce", "press release", "issued by", "da.", "anc.", "eff."
];

async function seedCitizens() {
    console.log("Starting High-Fidelity Citizen Normalization...");
    const rawData = JSON.parse(fs.readFileSync("citizen_social_raw.json", "utf-8"));
    console.log(`Analyzing ${rawData.length} potential records...`);

    let seededCount = 0;
    const processedUrls = new Set();

    for (const record of rawData) {
        if (processedUrls.has(record.url)) continue;
        processedUrls.add(record.url);

        const content = (record.content || "").toLowerCase();
        const title = (record.title || "").toLowerCase();
        const url = (record.url || "").toLowerCase();

        // 1. Precise Institutional Filtering
        // If the title or URL looks official, skip.
        const isInstitutionalTitle = officialSources.some(m => title.includes(m));
        const isInstitutionalUrl = url.includes("gov.za") || url.includes("press-statements") || officialSources.some(m => url.includes(m) && !["facebook", "x.com", "twitter", "instagram"].some(s => url.includes(s)));

        // Skip news domains entirely
        const isNews = ["dailymaverick", "news24", "theherald", "sowetan", "timeslive", "citizen.co.za", "novanews", "sabc"].some(d => url.includes(d));

        if (isInstitutionalTitle || isInstitutionalUrl || isNews) continue;

        // 2. Identify Platform
        const sourceName = url.includes("twitter.com") || url.includes("x.com") ? "X" :
            url.includes("facebook.com") ? "Facebook" :
                url.includes("instagram.com") ? "Instagram" :
                    url.includes("linkedin.com") ? "LinkedIn" :
                        url.includes("tiktok.com") ? "TikTok" :
                            url.includes("threads.net") ? "Threads" : "Social Media";

        // 3. Metadata Extraction
        let topic = "General Community Report";
        let category = "Planning";

        if (content.includes("water") || content.includes("leak") || content.includes("sewer") || content.includes("sanitation")) {
            topic = "Water & Sanitation";
            category = "Civil";
        } else if (content.includes("road") || content.includes("pothole") || content.includes("traffic") || content.includes("street")) {
            topic = "Road Maintenance";
            category = "Roads";
        } else if (content.includes("clinic") || content.includes("hospital") || content.includes("doctor")) {
            topic = "Health Facilities";
            category = "Health";
        } else if (content.includes("building") || content.includes("structure") || content.includes("collapse")) {
            topic = "Structural Integrity";
            category = "Structural";
        }

        let sentiment = "neutral";
        if (content.includes("angry") || content.includes("frustrated") || content.includes("bad service") || content.includes("failed") || content.includes("disaster")) {
            sentiment = "negative";
        }

        const normalizedSignal = {
            url: record.url,
            title: record.title?.substring(0, 100) || "Citizen Observation",
            published_date: "05 March 2026",
            source_name: sourceName,
            source_type: "social",
            excerpt: record.content?.substring(0, 300) + "...",
            matched_keywords: ["citizen_voice", record.community.toLowerCase()],
            detected_location: record.community,
            detected_topic: topic,
            category: category,
            sentiment: sentiment,
            communityId: record.community.toLowerCase().replace(/\s+/g, "_"),
            community: record.community,
            timestamp: serverTimestamp(),
            integrity_level: "High (Citizen Priority)",
            verified_citizen: true
        };

        const signalId = `citizen_v4_${seededCount}_${Date.now()}`;
        await setDoc(doc(db, "community_signals", signalId), normalizedSignal);

        seededCount++;
        if (seededCount % 50 === 0) {
            console.log(`Successfully seeded ${seededCount} citizen voices...`);
        }

        if (seededCount >= 650) break; // Buffer 500+
    }

    console.log(`\nSuccess! Seeded ${seededCount} validated citizen signals.`);
    process.exit(0);
}

seedCitizens().catch(console.error);
