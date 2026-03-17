const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
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
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function audit() {
    console.log("Starting Data Audit...");
    const snapshot = await getDocs(collection(db, "community_signals"));
    const signals = snapshot.docs.map(doc => doc.data());

    console.log(`Total Signals in DB: ${signals.length}`);

    const sourceTypes = {};
    const locations = {};
    const platforms = {};

    signals.forEach(s => {
        sourceTypes[s.source_type || "unknown"] = (sourceTypes[s.source_type || "unknown"] || 0) + 1;
        locations[s.detected_location || "unknown"] = (locations[s.detected_location || "unknown"] || 0) + 1;
        if (s.source_type === "social") {
            platforms[s.source_name] = (platforms[s.source_name] || 0) + 1;
        }
    });

    console.log("\n--- Source Type Distribution ---");
    console.table(sourceTypes);

    console.log("\n--- Location Distribution ---");
    console.table(locations);

    console.log("\n--- Social Platform Distribution ---");
    console.table(platforms);

    process.exit(0);
}

audit().catch(console.error);
