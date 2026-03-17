import * as fs from "fs";
import * as path from "path";

function loadEnv() {
    console.log("Current Directory:", process.cwd());
    const envPath = path.resolve(process.cwd(), ".env.local");
    console.log("Looking for .env.local at:", envPath);
    
    if (fs.existsSync(envPath)) {
        console.log("Found .env.local");
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return;
            const [key, ...valueParts] = trimmed.split("=");
            if (key && valueParts.length > 0) {
                const value = valueParts.join("=").trim();
                process.env[key.trim()] = value;
            }
        });
    } else {
        console.log("NOT FOUND .env.local");
    }
}

async function debug() {
    loadEnv();
    
    console.log("\n--- ENV DIAGNOSTIC ---");
    console.log("VERTEX_AI_API_KEY:", process.env.VERTEX_AI_API_KEY ? "EXISTS (Starts with: " + process.env.VERTEX_AI_API_KEY.substring(0, 10) + "...)" : "MISSING");
    console.log("NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "EXISTS" : "MISSING");
    console.log("TAVILY_API_KEY:", process.env.TAVILY_API_KEY ? "EXISTS" : "MISSING");
    
    try {
        console.log("\n--- GEMINI TEST (Flash) ---");
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.VERTEX_AI_API_KEY || "");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, verify system.");
        console.log("Gemini Response:", result.response.text());
    } catch (e: any) {
        console.error("Gemini Flash Error:", e.message);
        if (e.stack) {
            console.error("Stack hint:", e.stack.split('\n')[0]);
        }
    }

    try {
        console.log("\n--- FIREBASE TEST ---");
        const { initializeApp, getApps } = await import("firebase/app");
        const { getFirestore, collection, getDocs, limit, query } = await import("firebase/firestore");
        
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
        const q = query(collection(db, "communitySignals"), limit(1));
        const snap = await getDocs(q);
        console.log("Firebase Connectivity: OK (Signals found: " + snap.size + ")");
    } catch (e: any) {
        console.error("Firebase Error:", e.message);
    }
    
    process.exit(0);
}

debug();
