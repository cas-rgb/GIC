const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc, serverTimestamp } = require("firebase/firestore");
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
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const communities = [
    { name: "Khayelitsha", province: "Western Cape", municipality: "City of Cape Town", population: "400,000", lat: -34.03, lng: 18.67 },
    { name: "Soweto", province: "Gauteng", municipality: "City of Joburg", population: "1,300,000", lat: -26.24, lng: 27.85 },
    { name: "Hammanskraal", province: "Gauteng", municipality: "Tshwane", population: "20,000", lat: -25.40, lng: 28.28 },
    { name: "Rustenburg", province: "North West", municipality: "Rustenburg", population: "550,000", lat: -25.66, lng: 27.24 },
    { name: "Umlazi", province: "KwaZulu-Natal", municipality: "eThekwini", population: "400,000", lat: -29.96, lng: 30.88 },
    { name: "Motherwell", province: "Eastern Cape", municipality: "Nelson Mandela Bay", population: "140,000", lat: -33.82, lng: 25.61 },
    { name: "Tembisa", province: "Gauteng", municipality: "Ekurhuleni", population: "460,000", lat: -25.99, lng: 28.22 },
    { name: "Alexandra", province: "Gauteng", municipality: "City of Joburg", population: "180,000", lat: -26.10, lng: 28.10 },
    { name: "Mamelodi", province: "Gauteng", municipality: "Tshwane", population: "330,000", lat: -25.71, lng: 28.34 },
    { name: "Polokwane", province: "Limpopo", municipality: "Polokwane", population: "130,000", lat: -23.90, lng: 29.45 },
    { name: "Welkom", province: "Free State", municipality: "Matjhabeng", population: "210,000", lat: -27.97, lng: 26.73 },
    { name: "Mahikeng", province: "North West", municipality: "Mahikeng", population: "15,000", lat: -25.85, lng: 25.64 },
    { name: "Kimberley", province: "Northern Cape", municipality: "Sol Plaatje", population: "225,000", lat: -28.72, lng: 24.74 },
    { name: "Mdantsane", province: "Eastern Cape", municipality: "Buffalo City", population: "155,000", lat: -32.93, lng: 27.73 },
    { name: "Chatsworth", province: "KwaZulu-Natal", municipality: "eThekwini", population: "200,000", lat: -29.91, lng: 30.90 }
];

const leadership = [
    {
        name: "Panyaza Lesufi", role: "Premier", province: "Gauteng", party: "ANC",
        associates: [
            "Jacob Mamabolo (Infrastructure & Cogta)",
            "Kedibone Diale-Tlabela (Transport & Logistics)",
            "Nomantu Nkomo-Ralehoko (Health)",
            "Tasneem Motara (Human Settlements)"
        ],
        sentiment: 72
    },
    {
        name: "Alan Winde", role: "Premier", province: "Western Cape", party: "DA",
        associates: [
            "Tertuis Simmers (Infrastructure)",
            "Deidré Baartman (Finance)",
            "Mireille Wenger (Health)",
            "Isaac Sileku (Mobility)"
        ],
        sentiment: 78
    },
    {
        name: "Oscar Mabuyane", role: "Premier", province: "Eastern Cape", party: "ANC",
        associates: [
            "Siphokazi Lusithi (Public Works & Infrastructure)",
            "Xolile Nqatha (Transport)",
            "Ntombovuyo Nqayi (Health)",
            "Zolile Williams (Cogta)"
        ],
        sentiment: 61
    },
    {
        name: "Thami Ntuli", role: "Premier", province: "KwaZulu-Natal", party: "IFP",
        associates: [
            "Lukas Marthinus Meyer (Public Works & Infrastructure)",
            "Sboniso Duma (Transport & Human Settlements)",
            "Nomagugu Simelane (Health)",
            "Francois Rodgers (Finance)"
        ],
        sentiment: 65
    },
    { name: "Dean Macpherson", role: "Minister", portfolio: "Infrastructure", party: "DA" },
    { name: "Barbara Creecy", role: "Minister", portfolio: "Transport", party: "ANC" },
    { name: "Pemmy Majodina", role: "Minister", portfolio: "Water", party: "ANC" },
    { name: "Dr. Kgosientsho Ramokgopa", role: "Minister", portfolio: "Energy", party: "ANC" },
    { name: "Thembi Simelane", role: "Minister", portfolio: "Human Settlements", party: "ANC" },
    { name: "Dr. Aaron Motsoaledi", role: "Minister", portfolio: "Health", party: "ANC" }
];

const provincialPromises = [
    {
        province: "Gauteng",
        premier: "Panyaza Lesufi",
        promises: [
            { id: 'gp-1', statement: "Repair 31,000 identified potholes across provincial routes", date: "Feb 2026", status: "in_progress", sentiment: 68 },
            { id: 'gp-2', statement: "Expand water infrastructure for integration with Lesotho Highlands Phase 2", date: "Jan 2026", status: "in_progress", sentiment: 42 },
            { id: 'gp-3', statement: "Mitigate illegal mining activities in designated infrastructure corridors", date: "Feb 2026", status: "risk", sentiment: 15 }
        ]
    },
    {
        province: "Western Cape",
        premier: "Alan Winde",
        promises: [
            { id: 'wc-1', statement: "Maintain 2,275,000 m² of road network annually", date: "Feb 2026", status: "fulfilled", sentiment: 82 },
            { id: 'wc-2', statement: "Add 1,225 new residential units via social housing projects", date: "Jan 2026", status: "in_progress", sentiment: 55 },
            { id: 'wc-3', statement: "Energy Resilience Programme: 500MW additional provincial grid capacity", date: "Mar 2026", status: "in_progress", sentiment: 74 }
        ]
    },
    {
        province: "Eastern Cape",
        premier: "Oscar Mabuyane",
        promises: [
            { id: 'ec-1', statement: "Allocate R9.1bn to bulk water schemes for drought-prone areas", date: "Feb 2026", status: "in_progress", sentiment: 48 },
            { id: 'ec-2', statement: "Deliver 95 Welisizwe rural bridges in partnership with SANDF", date: "Jan 2026", status: "in_progress", sentiment: 62 }
        ]
    }
];

const infrastructureSignals = [
    {
        community: "Hammanskraal",
        issue: "Cholera Outbreak & Water Contamination",
        category: "Civil",
        title: "DWS addresses Hammanskraal water crisis",
        source: "News24",
        url: "https://www.news24.com/news24/southafrica/news/dws-to-spend-r400-million-on-hammanskraal-water-project-20230522",
        excerpt: "The Department of Water and Sanitation has allocated R400 million to resolve the persistent water quality issues in Hammanskraal following the cholera outbreak.",
        sentiment: "negative",
        urgency: 95
    },
    {
        community: "Khayelitsha",
        issue: "Sewage Spill & Sanitation Failure",
        category: "Civil",
        title: "Khayelitsha residents protest over sewage leaks",
        source: "GroundUp",
        url: "https://www.groundup.org.za/article/khayelitsha-residents-block-roads-demand-sewage-be-fixed/",
        excerpt: "Residents of Khayelitsha blocked several roads today demanding the City of Cape Town fix a major sewer burst that has flooded homes for weeks.",
        sentiment: "negative",
        urgency: 88
    },
    {
        community: "Soweto",
        issue: "Road Infrastructure & Pothole Crisis",
        category: "Roads",
        title: "Joburg Roads Agency launches Soweto pothole blitz",
        source: "TimesLIVE",
        url: "https://www.timeslive.co.za/news/south-africa/2024-01-15-jra-spending-r20m-to-fix-potholes-in-soweto/",
        excerpt: "The JRA has launched a high-intensity road maintenance program in Soweto to address the deteriorating state of arterial routes.",
        sentiment: "neutral",
        urgency: 81
    },
    {
        community: "Motherwell",
        issue: "Clinic Capacity & Health Staffing",
        category: "Health",
        title: "Motherwell clinics struggling with patient load",
        source: "Daily Maverick",
        url: "https://www.dailymaverick.co.za/article/2023-11-20-eastern-cape-health-crisis-motherwell-clinics-at-breaking-point/",
        excerpt: "Nurses at Motherwell clinics say they are overwhelmed as facility capacity fails to keep up with the growing local population.",
        sentiment: "negative",
        urgency: 75
    },
    {
        community: "Rustenburg",
        issue: "Housing Pressure & Town Planning Lag",
        category: "Planning",
        title: "Rustenburg mining belt faces housing shortage",
        source: "SABC News",
        url: "https://www.sabcnews.com/sabcnews/rustenburg-municipality-struggles-to-meet-housing-demand/",
        excerpt: "The rapid expansion of mining activities in Rustenburg has put immense pressure on housing and urban planning services.",
        sentiment: "neutral",
        urgency: 77
    }
];

async function seedHighFidelityData() {
    console.log("🚀 Starting GIC High-Fidelity Seeding...");

    // 1. Seed Communities
    console.log("📍 Seeding communities...");
    for (const c of communities) {
        const id = c.name.toLowerCase().replace(/\s+/g, "_");
        await setDoc(doc(db, "communities", id), {
            ...c,
            updatedAt: serverTimestamp()
        });
    }

    // 2. Seed Signals & News Articles
    console.log("📰 Seeding signals and evidence...");
    for (let i = 0; i < infrastructureSignals.length; i++) {
        const signal = infrastructureSignals[i];
        const id = `real_signal_${i}_${Date.now()}`;

        const communityId = signal.community.toLowerCase().replace(/\s+/g, "_");

        const normalizedSignal = {
            communityId,
            community: signal.community,
            detected_location: signal.community,
            issue: signal.issue,
            category: signal.category,
            detected_topic: signal.issue,
            sentiment: signal.sentiment,
            urgency: signal.urgency,
            title: signal.title,
            source_name: signal.source,
            url: signal.url,
            excerpt: signal.excerpt,
            published_date: "2024-03-01",
            timestamp: serverTimestamp()
        };

        await setDoc(doc(db, "community_signals", id), normalizedSignal);

        // Also seed full news_articles for evidence transparency
        await setDoc(doc(db, "news_articles", id), {
            title: signal.title,
            source: signal.source,
            url: signal.url,
            content: signal.excerpt,
            communityId,
            category: signal.category,
            date: "2024-03-01",
            timestamp: serverTimestamp()
        });
    }

    // 3. Seed Predictive Risks
    console.log("⚖️ Seeding institutional risk indicators...");
    const risks = [
        { issue: "Hammanskraal Water Quality Monitoring", urgency: 92, service: "Water & Sewerage" },
        { issue: "Khayelitsha Sanitation Infrastructure Protest", urgency: 88, service: "Water & Sewerage" },
        { issue: "Soweto Road Network Deterioration", urgency: 81, service: "Roads & Works" }
    ];

    for (let i = 0; i < risks.length; i++) {
        const r = risks[i];
        await setDoc(doc(db, "community_priority_scores", `risk_${i}`), {
            ...r,
            timestamp: serverTimestamp()
        });
    }

    // 4. Seed Leadership
    console.log("👔 Seeding leadership...");
    for (const l of leadership) {
        const id = l.name.toLowerCase().replace(/\s+/g, "_");
        await setDoc(doc(db, "leadership", id), {
            ...l,
            updatedAt: serverTimestamp()
        });
    }

    // 5. Seed Provincial Commitments
    console.log("📜 Seeding provincial commitments...");
    for (const p of provincialPromises) {
        const id = p.province.toLowerCase().replace(/\s+/g, "_");
        await setDoc(doc(db, "provincial_promises", id), {
            ...p,
            updatedAt: serverTimestamp()
        });
    }

    console.log("✅ High-Fidelity Seeding Complete!");
    process.exit(0);
}

seedHighFidelityData().catch(console.error);
