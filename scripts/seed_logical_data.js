const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp, deleteDoc } = require("firebase/firestore");
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

const SERVICES = [
    { id: 'water', name: 'Water & Sewerage', category: 'Civil' },
    { id: 'roads', name: 'Roads & Works', category: 'Roads' },
    { id: 'health', name: 'Health Infrastructure', category: 'Health' },
    { id: 'planning', name: 'Town Planning', category: 'Planning' },
    { id: 'structural', name: 'Structural Systems', category: 'Structural' },
    { id: 'apex', name: 'Apex Intelligence', category: 'Apex' }
];

const PROVINCES = ["Gauteng", "Western Cape", "KwaZulu-Natal"];
const MUNICIPALITIES = {
    "Gauteng": ["City of Joburg", "Ekurhuleni", "Tshwane", "Sedibeng"],
    "Western Cape": ["City of Cape Town", "Stellenbosch", "George", "Drakenstein"],
    "KwaZulu-Natal": ["eThekwini", "uMsunduzi", "uMhlathuze"]
};

// PREMIER DATA (Example)
const PREMIERS = {
    "Gauteng": { name: "Panyaza Lesufi", associates: ["Local Business Council", "Transport Dept", "Education Board"], sentiment: 62 },
    "Western Cape": { name: "Alan Winde", associates: ["Safety Council", "Agri-Industry", "Cape Chamber"], sentiment: 68 },
    "KwaZulu-Natal": { name: "Nomusa Dube-Ncube", associates: ["Port Authority", "Traditional Council", "Tourism KZN"], sentiment: 55 }
};

async function seedLogicalData() {
    console.log("Seeding GIC Logical Intelligence Ecosystem (Hierarchical)...");

    for (const province of PROVINCES) {
        for (const municipality of MUNICIPALITIES[province]) {
            for (const service of SERVICES) {
                const docId = `${service.id}_${province}_${municipality}`.replace(/\s+/g, '_');

                console.log(`Generating Logical Node: ${docId}`);

                // 1. VOLUME BY SOURCE
                const sourceVolume = {
                    x: 20 + Math.floor(Math.random() * 50),
                    facebook: 30 + Math.floor(Math.random() * 40),
                    news: 5 + Math.floor(Math.random() * 10),
                    instagram: 15 + Math.floor(Math.random() * 20),
                    linkedin: 10 + Math.floor(Math.random() * 15),
                    threads: 5 + Math.floor(Math.random() * 10)
                };

                // 2. WORD TREE DATA
                const wordTree = [
                    { word: "Supply", count: 85, weight: 1.0 },
                    { word: "Burst", count: 42, weight: 0.8 },
                    { word: "Reliability", count: 38, weight: 0.7 },
                    { word: "Maintenance", count: 33, weight: 0.6 },
                    { word: "Billing", count: 28, weight: 0.5 }
                ].map(w => ({ ...w, word: service.id === 'water' ? w.word : `${service.category} ${w.word}` }));

                // 3. INFLUENCERS
                const influencers = [
                    { name: `@InfraWatch_${municipality.split(' ')[0]}`, platform: "X", impact: 85, focus: "Service Delivery" },
                    { name: `${municipality} Community Group`, platform: "Facebook", impact: 92, focus: "Municipal Oversight" }
                ];

                // 4. SIMILARITY LOGIC (Success Matching)
                const similarity = {
                    matchedCase: "Tshwane Water Portal 2023",
                    reason: "Demographic alignment and initial infrastructure lag indices match current node parameters.",
                    marketingStrategy: "Utilize localized radio (WhatsApp) and Ward Councillor townhalls to address billing transparency."
                };

                // 5. PREMIER PULSE (Contextualized)
                const premier = PREMIERS[province];

                await setDoc(doc(db, "gic_logical_intelligence", docId), {
                    serviceId: service.id,
                    province,
                    municipality,
                    sourceVolume,
                    wordTree,
                    influencers,
                    similarity,
                    premier,
                    totalPoints: Object.values(sourceVolume).reduce((a, b) => a + b, 0),
                    lastUpdated: serverTimestamp()
                });
            }
        }
    }

    // ALSO SEED APEX TOTALS
    for (const province of PROVINCES) {
        await setDoc(doc(db, "gic_logical_intelligence", `apex_${province}_all`), {
            serviceId: 'apex',
            province,
            municipality: 'All',
            sourceVolume: { x: 450, facebook: 580, news: 120, instagram: 240, linkedin: 180, threads: 110 },
            lastUpdated: serverTimestamp()
        });
    }

    console.log("Strategic Logic Seeding Complete.");
    process.exit(0);
}

seedLogicalData().catch(console.error);
