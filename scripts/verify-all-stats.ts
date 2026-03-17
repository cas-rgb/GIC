import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { loadEnv } from './load-env-cli';

loadEnv();

const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function verifyAll() {
    console.log("Initializing minimal Firebase...");
    try {
        const app = initializeApp(config);
        const db = getFirestore(app);
        
        const collections = ["community_issue", "community_signals", "public_signal_raw", "provincial_budget_topic_allocation"];
        
        for (const col of collections) {
            const snap = await getDocs(collection(db, col));
            console.log(`Collection ${col}: ${snap.size} documents.`);
            
            if (col === "community_issue") {
                console.log("\n--- Latest 5 Strategic Narrative Signals ---");
                const issues = snap.docs.slice(-5);
                issues.forEach(d => {
                   const data = d.data();
                   console.log(`- [${data.primary_topic}] ${data.source_title}`);
                   console.log(`  Snippet: ${data.evidence_snippet}`);
                   console.log(`  Municipality: ${data.municipality || 'Provincial'}`);
                });
            }
        }
    } catch (e: any) {
        console.error("Verification failed:", e.message);
    }
    process.exit(0);
}

verifyAll();
