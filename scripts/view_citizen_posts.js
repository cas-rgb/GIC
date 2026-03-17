const { initializeApp } = require("firebase/app");
const { getFirestore, collection, query, where, getDocs, limit, orderBy } = require("firebase/firestore");
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

async function viewCitizenPosts() {
    console.log("Fetching a sample of ORDINARY CITIZEN posts from the last 90 days...\n");

    // Query for signals marked as verified citizens
    const signalsRef = collection(db, "community_signals");
    const q = query(
        signalsRef,
        where("verified_citizen", "==", true),
        limit(10)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log("No citizen-verified posts found. Checking broader social signals...");
        const broadQ = query(signalsRef, where("source_type", "==", "social"), limit(10));
        const broadSnapshot = await getDocs(broadQ);
        displaySignals(broadSnapshot);
    } else {
        displaySignals(querySnapshot);
    }

    process.exit(0);
}

function displaySignals(snapshot) {
    snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`--- [${data.source_name}] @ ${data.detected_location} ---`);
        console.log(`Topic: ${data.detected_topic} | Sentiment: ${data.sentiment}`);
        console.log(`Excerpt: ${data.excerpt}`);
        console.log(`Link: ${data.url}`);
        console.log("\n");
    });
}

viewCitizenPosts().catch(console.error);
