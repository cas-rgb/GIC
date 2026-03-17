import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, limit, getDocs } from "firebase/firestore";

function loadEnv() {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const [key, ...valueParts] = line.split("=");
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join("=").trim();
            }
        });
    }
}

async function sampleData() {
    loadEnv();
    
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const collections = ['gic_projects', 'riskSignals', 'leadership', 'universal_signals', 'communities'];
    
    console.log("--- DATA SAMPLING FOR 3D VIZ ---");
    for (const col of collections) {
        try {
            const q = query(collection(db, col), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                console.log(`\n[COLLECTION: ${col}] SAMPLE:`);
                console.log(JSON.stringify(snapshot.docs[0].data(), null, 2));
            } else {
                console.log(`\n[COLLECTION: ${col}] is empty.`);
            }
        } catch (e) {
            console.log(`\n[COLLECTION: ${col}] FAILED:`, e);
        }
    }
}

sampleData().catch(console.error);
