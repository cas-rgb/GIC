
import { loadEnv } from "./scripts/load-env-cli";
loadEnv();

async function debugFirestore() {
    console.log("--- Debugging Firestore Initialization ---");
    try {
        const { db } = await import("./src/lib/firebase");
        const { collection } = await import("firebase/firestore");
        
        console.log("Checking process.env for Firebase keys:");
        console.log("  NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
        
        console.log("\nInspecting 'db' object:");
        console.log("  Type:", typeof db);
        console.log("  Constructor Name:", db?.constructor?.name);
        
        if (!db) {
            console.error("  [FAIL] 'db' is undefined or null.");
        } else {
            console.log("  'db' exists.");
            try {
                const col = collection(db, "test");
                console.log("  [SUCCESS] collection(db, 'test') worked!");
            } catch (e: any) {
                console.error("  [FAILED] collection(db, 'test') threw error:", e.message);
                console.error(e);
            }
        }
    } catch (err) {
        console.error("  [CRITICAL ERROR] during debug script:", err);
    }
}

debugFirestore();
