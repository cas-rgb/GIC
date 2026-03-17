import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { loadEnv } from './load-env-cli';

// Load environment variables
loadEnv();

const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function verify() {
    console.log("Initializing minimal Firebase...");
    const app = initializeApp(config);
    const db = getFirestore(app);
    
    const provinces = ['Western Cape', 'North West', 'Mpumalanga', 'Eastern Cape', 'Gauteng'];
    console.log("Verifying collections...");

    for (const province of provinces) {
        try {
            const q = query(collection(db, "community_issue"), where('province', '==', province));
            const snap = await getDocs(q);
            console.log(`${province}: ${snap.size} issues found.`);
        } catch (e: any) {
            console.error(`Error for ${province}:`, e.message);
        }
    }
    process.exit(0);
}

verify();
