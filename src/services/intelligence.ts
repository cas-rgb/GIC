"use server";

import { deepResearch } from "./tavily-service";
import { AISignal } from "@/types";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { analyzeCommunitySentiment } from "./ai-service";

const PROVINCES = [
    { name: "Eastern Cape", premier: "Oscar Mabuyane" },
    { name: "Mpumalanga", premier: "Mandla Ndlovu" },
    { name: "Northern Cape", premier: "Zamani Saul" },
    { name: "Western Cape", premier: "Alan Winde" }
];

const INFRA_TERMS = [
    "water shortage crisis",
    "sewerage failure",
    "road maintenance protests",
    "clinic shortage",
    "housing development delays",
    "premier infrastructure statements"
];

export async function refreshProvincialIntelligence() {
    console.log("Starting Advanced Recursive Research for Provinces...");

    for (const province of PROVINCES) {
        // 1. Execute Deep Research (Recursive pattern for evolving signals)
        const searchQuery = `${province.name} ${INFRA_TERMS.join(" | ")} ${province.premier}`;
        const searchResults = await deepResearch(searchQuery);

        if (searchResults && searchResults.results) {
            // 2. Synthesize with AI
            const rawText = searchResults.results.map(r => `${r.title}: ${r.content}`).join("\n\n");
            const signals = await analyzeCommunitySentiment(rawText);

            // 3. Store in Firestore
            for (const signal of signals) {
                await addDoc(collection(db, "community_signals"), {
                    ...signal,
                    province: province.name,
                    premierMentioned: province.premier,
                    timestamp: serverTimestamp(),
                    ingestedAt: new Date().toISOString()
                });
            }
        }
    }

    return { success: true, message: "Provincial intelligence updated." };
}

export async function getLatestSignals(province?: string) {
    const signalRef = collection(db, "community_signals");
    let q;

    if (province) {
        q = query(signalRef, where("province", "==", province), orderBy("timestamp", "desc"), limit(20));
    } else {
        q = query(signalRef, orderBy("timestamp", "desc"), limit(20));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
