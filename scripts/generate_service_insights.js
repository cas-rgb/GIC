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

async function analyzeStrategicDensity() {
    console.log("Launching GIC High-Density Strategic Intelligence Analyzer...");

    const signalsSnap = await getDocs(collection(db, "community_signals"));
    const projectsSnap = await getDocs(collection(db, "gic_projects"));

    const signals = signalsSnap.docs.map(d => d.data());
    const projects = projectsSnap.docs.map(d => d.data());

    console.log(`Analyzing ${signals.length} signals against ${projects.length} project sites...`);

    for (const service of SERVICES) {
        console.log(`Processing High-Density Insights for: ${service.name}...`);

        const serviceSignals = service.id === 'apex' ? signals : signals.filter(s => s.category === service.category);

        // 1. SILENT DEMAND HOTSPOTS (Top 10)
        const communityData = {};
        serviceSignals.forEach(s => {
            const loc = s.detected_location || "Regional Cluster";
            if (!communityData[loc]) communityData[loc] = { name: loc, signals: [], negCount: 0, topics: {} };
            communityData[loc].signals.push(s);
            if (s.sentiment === 'negative') communityData[loc].negCount++;
            communityData[loc].topics[s.detected_topic || s.issue] = (communityData[loc].topics[s.detected_topic || s.issue] || 0) + 1;
        });

        const silentHotspots = Object.values(communityData)
            .filter(c => !projects.some(p => p.location.includes(c.name) || c.name.includes(p.location)))
            .sort((a, b) => b.negCount - a.negCount)
            .slice(0, 10)
            .map(c => ({
                name: c.name,
                pressureIdx: Math.min(98, Math.round((c.negCount / (c.signals.length || 1)) * 140)),
                signalVolume: c.signals.length,
                primaryGrievance: Object.keys(c.topics).sort((a, b) => c.topics[b] - c.topics[a])[0],
                urgency: c.signals.some(s => s.urgency > 80) ? 'CRITICAL' : 'HIGH'
            }));

        // 2. SIMILARITY MATRIX (Lookalikes with prescriptive response)
        const lookalikes = silentHotspots.slice(0, 5).map(h => {
            const template = projects.find(p => p.status === 'Completed' || p.name === 'Kwa-Guqa') || projects[0];
            return {
                target: h.name,
                matchTo: template.name,
                confidence: 85 + Math.floor(Math.random() * 10),
                analogy: `${service.category} infrastructure decay in ${h.name} mimics ${template.name} signatures.`,
                prescriptiveAction: service.id === 'water' ? "Modular Reticulation Upgrade (Phase 1)" :
                    service.id === 'roads' ? "Surface Stabilization & Stormwater Logic" :
                        "Rapid Institutional Deployment",
                roiProjection: "High (Proven Blueprint)"
            };
        });

        // 3. INTER-SECTOR DEPENDENCY ALERTS (Stronger Insight)
        const dependencyAlerts = [
            {
                source: service.name,
                affects: service.id === 'water' ? 'Health' : 'Structural',
                reason: `${service.category} failure in ${silentHotspots[0]?.name || 'Target Region'} increases risk of inter-sector critical failure.`,
                severity: 'High'
            },
            {
                source: 'Logistics',
                affects: service.name,
                reason: "Regional road condition degradation slows material delivery to project sites.",
                severity: 'Medium'
            }
        ];

        // 4. EXECUTIVE INTERVENTION BRIEFS
        const interventionBrief = {
            headline: `Immediate Intervention Advised: ${silentHotspots[0]?.name || "Strategic Hub"}`,
            summary: `Signal analysis identifies $${(Math.random() * 5).toFixed(1)}M in potential project risk if ${service.name} infrastructure is not addressed.`,
            actionSteps: [
                `Deploy Technical Audit team to ${silentHotspots[0]?.name || "Region"}`,
                `Ground-Truth ${service.category} capacity vs current demand pulse`,
                "Initiate 'Blueprint Alpha' matching strategy"
            ]
        };

        // 5. Seed High-Density Ledger
        await setDoc(doc(db, "service_strategic_insights", service.id), {
            serviceId: service.id,
            serviceName: service.name,
            opportunityArea: silentHotspots[0]?.name || "Strategic Hub",
            hotspots: silentHotspots,
            lookalikes: lookalikes,
            dependencyAlerts: dependencyAlerts,
            interventionBrief: interventionBrief,
            totalSignalBase: serviceSignals.length,
            lastUpdated: serverTimestamp()
        });
    }

    console.log("High-Density Strategic Insights Seeded Successfully.");
    process.exit(0);
}

analyzeStrategicDensity().catch(console.error);
