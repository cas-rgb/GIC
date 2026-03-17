import { db } from "./src/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

async function countData() {
    console.log("--- GIC DATA DIAGNOSTIC ---");
    
    const signals = await getDocs(collection(db, "communitySignals"));
    const datasets = await getDocs(collection(db, "strategicDatasets"));
    const communities = await getDocs(collection(db, "communities"));
    
    console.log(`[ALERTS] Community Signals: ${signals.size}`);
    console.log(`[SATELLITE] Strategic Datasets: ${datasets.size}`);
    console.log(`[COMMAND] Communities Synthetic: ${communities.size}`);
    
    process.exit(0);
}

countData();
