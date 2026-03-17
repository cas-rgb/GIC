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

async function processAndSeed() {
    console.log("Starting High-Fidelity Normalization...");
    const rawData = JSON.parse(fs.readFileSync("raw_osint_data.json", "utf-8"));
    console.log(`Processing ${rawData.length} records...`);

    let count = 0;
    for (const record of rawData) {
        // 1. Rule-based Normalization
        const sourceName = record.url.includes("twitter.com") || record.url.includes("x.com") ? "X" :
            record.url.includes("facebook.com") ? "Facebook" :
                record.url.includes("instagram.com") ? "Instagram" :
                    record.url.includes("linkedin.com") ? "LinkedIn" :
                        record.url.includes("tiktok.com") ? "TikTok" :
                            record.url.includes("dailymaverick") ? "Daily Maverick" :
                                record.url.includes("news24") ? "News24" : "Local News";

        const sourceType = ["X", "Facebook", "Instagram", "LinkedIn", "TikTok"].includes(sourceName) ? "social" : "local news";

        // Topic Detection
        let topic = "General Infrastructure";
        let category = "Planning";
        const content = (record.content || "").toLowerCase();

        if (content.includes("water") || content.includes("sewer") || content.includes("leak")) {
            topic = "Water & Sanitation";
            category = "Civil";
        } else if (content.includes("pothole") || content.includes("road") || content.includes("traffic")) {
            topic = "Road Maintenance";
            category = "Roads";
        } else if (content.includes("clinic") || content.includes("hospital") || content.includes("health")) {
            topic = "Health Facilities";
            category = "Health";
        } else if (content.includes("building") || content.includes("structure") || content.includes("collapse")) {
            topic = "Structural Integrity";
            category = "Structural";
        } else if (content.includes("protest") || content.includes("unrest") || content.includes("shutdown")) {
            topic = "Community Action";
            category = "Planning";
        }

        // Sentiment
        let sentiment = "neutral";
        if (content.includes("frustrated") || content.includes("collapse") || content.includes("failure") || content.includes("broken") || content.includes("crisis")) {
            sentiment = "negative";
        } else if (content.includes("progress") || content.includes("success") || content.includes("improved") || content.includes("restored")) {
            sentiment = "positive";
        }

        // Date extraction (cheap regex)
        const dateMatch = record.content?.match(/\d{1,2} [A-Z][a-z]+ 202[4-6]/);
        const publishedDate = dateMatch ? dateMatch[0] : "2026-03-01"; // Default to current project timeline

        const normalizedSignal = {
            url: record.url,
            title: record.title?.substring(0, 100) || "Service Delivery Report",
            published_date: publishedDate,
            source_name: sourceName,
            source_type: sourceType,
            excerpt: record.content?.substring(0, 300) + "...",
            matched_keywords: [topic.toLowerCase(), record.community.toLowerCase()],
            detected_location: record.community,
            detected_topic: topic,
            category: category,
            sentiment: sentiment,
            communityId: record.community.toLowerCase().replace(/\s+/g, "_"),
            community: record.community,
            timestamp: serverTimestamp()
        };

        const signalId = `scaled_v2_${count}_${Date.now()}`;
        await setDoc(doc(db, "community_signals", signalId), normalizedSignal);

        count++;
        if (count % 100 === 0) {
            console.log(`Seeded ${count} signals...`);
        }
    }

    console.log(`Success! Seeded ${count} normalized real-world signals.`);
    process.exit(0);
}

processAndSeed().catch(console.error);
