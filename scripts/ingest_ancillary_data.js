const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } = require("firebase/firestore");
const { tavily } = require("@tavily/core");
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
const tClient = tavily({ apiKey: env.NEXT_PUBLIC_TAVILY_API_KEY });

const GIC_MUNICIPALITIES = [
    { name: "eMalahleni", province: "Mpumalanga", region: "Kwa-Guqa" },
    { name: "Metsimaholo", province: "Free State", region: "Sasolburg" },
    { name: "Moqhaka", province: "Free State", region: "Kroonstad" },
    { name: "Sol Plaatje", province: "Northern Cape", region: "Kimberley" },
    { name: "Siyathemba", province: "Northern Cape", region: "Prieska" },
    { name: "Matatiele", province: "Eastern Cape", region: "Alfred Nzo" },
    { name: "Msunduzi", province: "KwaZulu-Natal", region: "Pietermaritzburg" },
    { name: "Buffalo City", province: "Eastern Cape", region: "East London" }
];

async function ingestGroundingData() {
    console.log("Starting GIC Ancillary Data Harvester (Crime/Socio-Economics)...");

    for (const muni of GIC_MUNICIPALITIES) {
        console.log(`\nAnalyzing ${muni.name} (${muni.province})...`);

        try {
            // 1. Search for Regional Risk Metadata
            const query = `${muni.name} South Africa crime statistics 2024 unemployment rate service delivery protests infrastructure vandalism`;
            const searchRes = await tClient.search(query, {
                searchDepth: "advanced",
                maxResults: 5
            });

            const context = searchRes.results.map(r => r.content).join("\n");

            // 2. Extract Key Benchmarks (Simplified for now, will be used by Vertex later)
            // In a real prod env, we'd use a specialized extractor here. 
            // For this run, we store the raw context as 'Grounding Evidence'
            await setDoc(doc(db, "regional_benchmarks", muni.name.toLowerCase().replace(/\s+/g, '_')), {
                municipality: muni.name,
                province: muni.province,
                region: muni.region,
                ground_context: context,
                sources: searchRes.results.map(r => r.url),
                lastUpdated: serverTimestamp(),
                risk_profile: {
                    crime_index: "High-Verification Required",
                    unemployment: "StatsSA Grounded",
                    protest_frequency: "OSINT Derived"
                }
            });

            console.log(`   Successfully seeded benchmarks for ${muni.name}.`);
        } catch (error) {
            console.error(`   Error ingesting ${muni.name}:`, error.message);
        }
    }

    console.log("\nAncillary Data Ingestion Complete.");
    process.exit(0);
}

ingestGroundingData().catch(console.error);
