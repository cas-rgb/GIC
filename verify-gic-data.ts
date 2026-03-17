import * as fs from "fs";
import * as path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

// Simple .env.local loader
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

async function verifyData() {
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

    const collections = ['strategicDatasets', 'tenders', 'leaders', 'planningBudgets', 'riskSignals'];
    const countries = ['South Africa', 'Namibia', 'Botswana', 'Eswatini', 'Lesotho'];

    console.log("--- GIC DATA AUDIT ---");
    for (const country of countries) {
        console.log(`\n[COUNTRY: ${country}]`);
        for (const col of collections) {
            const q = query(collection(db, col), where('country', '==', country));
            const snapshot = await getDocs(q);
            console.log(`- ${col}: ${snapshot.size} records`);
        }
    }
}

verifyData().catch(console.error);
