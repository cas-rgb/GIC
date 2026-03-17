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

const PROVINCES = [
    { id: "eastern_cape", name: "Eastern Cape", municipalities: ["Nelson Mandela Bay", "Buffalo City", "OR Tambo"] },
    { id: "mpumalanga", name: "Mpumalanga", municipalities: ["City of Mbombela", "Emalahleni", "Steve Tshwete"] },
    { id: "northern_cape", name: "Northern Cape", municipalities: ["Sol Plaatje", "Dawid Kruiper", "Ga-Segonyana"] },
    { id: "western_cape", name: "Western Cape", municipalities: ["City of Cape Town", "Drakenstein", "George", "Stellenbosch"] }
];

const ISSUES = [
    { topic: "Infrastructure Failure", category: "Civil", signals: ["Localized load reduction due to substation vandalism", "Total shutdown of water pump at regional clinic", "Zama Zamas reported near structural foundations of N2 bridge"] },
    { topic: "Road Deterioration", category: "Roads", signals: ["Potholes on major arterial routes causing transit delays", "Bridge structural concerns after heavy rains", "Community demanding road resurfacing and proper drainage"] },
    { topic: "Clinic Capacity", category: "Health", signals: ["Long wait times at regional clinics leading to protest threats", "Medical supply chain disruptions across district", "Proposal for new satellite health center in peri-urban area"] },
    { topic: "Energy Stability", category: "Planning", signals: ["Transformer explosion causing 48h blackout", "Call for renewable energy integration to stop load reduction", "Community planning for solar-powered clinic lights"] }
];

const SOURCE_TYPES = ["local news", "community radio", "radio bulletin", "NGO report", "X", "Facebook"];

async function seedRegionalData() {
    console.log("Seeding High-Fidelity Regional Intelligence...");
    let count = 0;

    for (const province of PROVINCES) {
        for (const municipality of province.municipalities) {
            for (const issue of ISSUES) {
                const signalId = `reg_${province.id}_${municipality.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${count}`;
                const sentiment = Math.random() > 0.6 ? "negative" : Math.random() > 0.3 ? "neutral" : "positive";
                const sourceType = SOURCE_TYPES[Math.floor(Math.random() * SOURCE_TYPES.length)];

                const signal = {
                    communityId: municipality.toLowerCase().replace(/\s+/g, '_'),
                    community: municipality,
                    province: province.name,
                    issue: `${issue.topic}: ${issue.signals[Math.floor(Math.random() * issue.signals.length)]}`,
                    sentiment: sentiment,
                    urgency: Math.floor(Math.random() * 60) + 40,
                    category: issue.category,
                    published_date: "2026-03-05",
                    source_name: sourceType === "community radio" ? "Voice of the People FM" : "Local News Intelligence",
                    source_type: sourceType,
                    timestamp: serverTimestamp()
                };

                await setDoc(doc(db, "community_signals", signalId), signal);
                count++;
            }
        }
    }

    console.log(`Successfully seeded ${count} regional signals across 4 provinces.`);
    process.exit(0);
}

seedRegionalData().catch(console.error);
