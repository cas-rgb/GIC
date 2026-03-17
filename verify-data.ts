import { db } from "./src/lib/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function auditData() {
    console.log("--- GIC DATA AUDIT ---");
    const collections = ['datasetEntries', 'leaders', 'tenders', 'opportunities', 'riskSignals', 'planningBudgets'];
    
    for (const colName of collections) {
        try {
            const colRef = collection(db, colName);
            const snapshot = await getDocs(query(colRef, limit(100)));
            console.log(`Collection: ${colName} | Count (Sample): ${snapshot.size}`);
            
            if (snapshot.size > 0) {
                const first = snapshot.docs[0].data();
                console.log(` - Sample Municipality: ${first.municipality || 'N/A'}`);
                if (first.ward) console.log(` - Sample Ward: ${first.ward}`);
            }
        } catch (error) {
            console.error(`Error auditing ${colName}:`, error.message);
        }
    }
    console.log("--- AUDIT COMPLETE ---");
}

auditData();
