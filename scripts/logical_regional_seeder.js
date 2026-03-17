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

const PROVINCES = ["Eastern Cape", "Mpumalanga", "Northern Cape", "Western Cape"];
const SERVICE_IDS = ["apex", "roads", "water"];

async function seedLogicalIntelligence() {
    console.log("Seeding Regional Logical Intelligence Matrix...");

    for (const province of PROVINCES) {
        for (const serviceId of SERVICE_IDS) {
            const docId = `${serviceId}_${province}_All`.replace(/\s+/g, '_');

            const logicalDoc = {
                sourceVolume: {
                    labels: ["X", "Facebook", "Local News", "Radio Bulletins", "NGO Reports"],
                    datasets: [{
                        label: 'Intelligence Volume',
                        data: [
                            20 + Math.floor(Math.random() * 30),
                            30 + Math.floor(Math.random() * 40),
                            15 + Math.floor(Math.random() * 20),
                            10 + Math.floor(Math.random() * 15),
                            5 + Math.floor(Math.random() * 10)
                        ]
                    }]
                },
                wordTree: {
                    name: province,
                    children: [
                        { name: "Infrastructure", value: 400 },
                        { name: "Service", value: 300 },
                        { name: "Premier", value: 200 },
                        { name: "Demand", value: 150 }
                    ]
                },
                influencers: [
                    { name: "@LocalJournalist", category: "News", score: 85 },
                    { name: "CivicOrg_ZA", category: "NGO", score: 78 },
                    { name: "Radio_101", category: "Media", score: 92 }
                ],
                similarity: {
                    matchedCase: province === "Eastern Cape" ? "Mpumalanga Water Crisis 2023" : "Tshwane Load Reduction",
                    confidence: 0.88,
                    suggestedStrategy: "Proactive community engagement via local radio stakeholders."
                },
                premier: {
                    sentiment: [
                        { label: 'Jan', positive: 40, negative: 10 },
                        { label: 'Feb', positive: 45, negative: 15 },
                        { label: 'Mar', positive: 50, negative: 12 }
                    ]
                },
                timestamp: serverTimestamp()
            };

            await setDoc(doc(db, "gic_logical_intelligence", docId), logicalDoc);
        }
    }

    console.log("Successfully seeded Logical Intelligence fallback docs for all provinces.");
    process.exit(0);
}

seedLogicalIntelligence().catch(console.error);
