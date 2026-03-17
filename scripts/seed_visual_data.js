const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp } = require("firebase/firestore");
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

const MUNICIPALITIES = ["Kimberley", "Sasolburg", "Kwa-Guqa", "Prieska", "eMalahleni", "Matlosana", "Sol Plaatje"];

async function seedVisualData() {
    console.log("Seeding GIC High-Volume Visual Data Ecosystem...");

    const signalsSnap = await getDocs(collection(db, "community_signals"));
    const signals = signalsSnap.docs.map(d => d.data());

    for (const service of SERVICES) {
        console.log(`Generating 8-Visual Dataset for: ${service.name}...`);

        const serviceSignals = service.id === 'apex' ? signals : signals.filter(s => s.category === service.category);

        // 1. SIGNAL PULSE (Timeline - 7 Days)
        const pulse = Array.from({ length: 7 }).map((_, i) => ({
            day: `Day ${i + 1}`,
            volume: 40 + Math.floor(Math.random() * 60)
        }));

        // 2. SECTOR GRAVITY (Donut - Category Distribution)
        const gravity = SERVICES.filter(s => s.id !== 'apex').map(s => ({
            name: s.name,
            value: signals.filter(sig => sig.category === s.category).length
        }));

        // 3. SENTIMENT VELOCITY (Trend - 7 Days)
        const sentimentTrend = Array.from({ length: 7 }).map((_, i) => ({
            day: i,
            score: 30 + Math.floor(Math.random() * 50)
        }));

        // 4. REGIONAL HEATMAP (Grid)
        const heatmap = MUNICIPALITIES.map(m => ({
            name: m,
            urgency: 40 + Math.floor(Math.random() * 50),
            impact: 30 + Math.floor(Math.random() * 60)
        }));

        // 5. MUNICIPAL GROUNDING RADAR (Stats)
        const radar = {
            crime: 65 + Math.random() * 20,
            unrest: 40 + Math.random() * 30,
            delivery_stress: 70 + Math.random() * 15,
            vandalism: 50 + Math.random() * 25,
            governance_lag: 35 + Math.random() * 20
        };

        // 6. SECTOR DEPENDENCY MATRIX
        const dependencies = SERVICES.filter(s => s.id !== service.id && s.id !== 'apex').slice(0, 3).map(s => ({
            affects: s.name,
            coefficient: (Math.random() * 0.8).toFixed(2),
            reason: `${service.category} failure impacts ${s.name} stability.`
        }));

        // 7. RELIABILITY GAUGE
        const reliability = {
            osint_density: 85 + Math.random() * 10,
            benchmark_alignment: 75 + Math.random() * 20,
            groundTruth_hits: Math.floor(Math.random() * 500)
        };

        // 8. PREDICTIVE GROWTH (Forecast)
        const forecast = [
            { period: '6mo', growth: 12 + Math.random() * 5 },
            { period: '12mo', growth: 25 + Math.random() * 10 },
            { period: '36mo', growth: 45 + Math.random() * 20 }
        ];

        // Seeding the data
        await setDoc(doc(db, "service_visual_analytics", service.id), {
            serviceId: service.id,
            serviceName: service.name,
            pulse,
            gravity,
            sentimentTrend,
            heatmap,
            radar,
            dependencies,
            reliability,
            forecast,
            totalSignalVolume: serviceSignals.length,
            lastUpdated: serverTimestamp()
        });

        // Also update standard strategic insights with stronger prescriptive logic
        await setDoc(doc(db, "service_strategic_insights", service.id), {
            serviceId: service.id,
            serviceName: service.name,
            opportunityArea: heatmap.sort((a, b) => b.urgency - a.urgency)[0].name,
            interventionBrief: {
                headline: `Critical Action: ${service.name} Node in ${heatmap[0].name}`,
                summary: `Data volume indicates a 28% increase in situational volatility. Immediate blueprint deployment is advised.`,
                actionSteps: [
                    "Authorize Local Audit",
                    "Establish Community Liaison",
                    "Release Procurement Draft"
                ]
            },
            lastUpdated: serverTimestamp()
        });
    }

    console.log("High-Volume Visual Data Seeding Complete.");
    process.exit(0);
}

seedVisualData().catch(console.error);
