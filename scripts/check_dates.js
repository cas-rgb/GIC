const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach(line => {
    const [key, value] = line.split("=");
    if (key && value) env[key.trim()] = value.trim().replace(/"/g, "");
});

const app = initializeApp({
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

async function checkDates() {
    const snapshot = await getDocs(collection(db, "community_signals"));
    const dates = snapshot.docs.map(d => d.data().published_date).filter(Boolean);

    // Some dates are "YYYY-MM-DD", some are "D Month YYYY" from the regex
    // Let's just print a few unique ones to see the variety
    const uniqueDates = Array.from(new Set(dates)).sort();

    console.log("Earliest Date Found:", uniqueDates[0]);
    console.log("Latest Date Found:", uniqueDates[uniqueDates.length - 1]);
    console.log("\nSample of unique dates:");
    console.log(uniqueDates.slice(0, 10));
    console.log(uniqueDates.slice(-10));

    process.exit(0);
}

checkDates().catch(console.error);
