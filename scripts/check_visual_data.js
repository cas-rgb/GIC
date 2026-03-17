const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

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

async function checkData() {
    console.log("Checking service_visual_analytics data...");
    const snap = await getDocs(collection(db, "service_visual_analytics"));
    console.log(`Found ${snap.docs.length} documents in service_visual_analytics.`);
    snap.docs.forEach(d => {
        console.log(` - Document ID: ${d.id}`);
    });

    const insightsSnap = await getDocs(collection(db, "service_strategic_insights"));
    console.log(`Found ${insightsSnap.docs.length} documents in service_strategic_insights.`);
    insightsSnap.docs.forEach(d => {
        console.log(` - Document ID: ${d.id}`);
    });
    process.exit(0);
}

checkData().catch(console.error);
