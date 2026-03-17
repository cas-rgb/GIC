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
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const projects = [
    {
        id: "kwa_guqa",
        name: "Kwa-Guqa",
        location: "eMalahleni",
        province: "Mpumalanga",
        description: "Internal civil services including 3km of sewer and water networks.",
        status: "Completed",
        beneficiaries: "800+ stands",
        period: "Jan 2021 - Jun 2022",
        lat: -25.88,
        lng: 29.18
    },
    {
        id: "nooitgedacht",
        name: "Nooitgedacht Plot 107-124",
        location: "Carolina",
        province: "Mpumalanga",
        description: "Internal civil services including road and associated works.",
        status: "Completed",
        beneficiaries: "618 stands",
        period: "Jan - May 2021",
        lat: -26.06,
        lng: 30.11
    },
    {
        id: "sasolburg",
        name: "Sasolburg",
        location: "Sasolburg",
        province: "Free State",
        description: "Internal civil services for multiple extensions.",
        status: "Active",
        beneficiaries: "4,500 stands",
        period: "Ongoing",
        lat: -26.81,
        lng: 27.83
    },
    {
        id: "phola_x1",
        name: "Phola X1",
        location: "Phola",
        province: "Mpumalanga",
        description: "Water, sewerage, and road infrastructure installation.",
        status: "Completed",
        beneficiaries: "376 stands",
        period: "Jun 2022 - Jun 2024",
        lat: -25.98,
        lng: 29.02
    },
    {
        id: "prieska",
        name: "Prieska",
        location: "Prieska",
        province: "Northern Cape",
        description: "6km of roads, 13.5km sewerage, 13.5km water pipes.",
        status: "Completed",
        beneficiaries: "1670 stands",
        period: "Jun 2023 - Mar 2025",
        lat: -29.67,
        lng: 22.75
    },
    {
        id: "boxwood",
        name: "Boxwood",
        location: "Community Development",
        province: "TBD",
        description: "Housing project revitalisation with sewer and water upgrades.",
        status: "Active",
        beneficiaries: "Community Wide",
        period: "Ongoing",
        lat: -26.23,
        lng: 28.14
    },
    {
        id: "maokeng_x12",
        name: "Maokeng X12",
        location: "Maokeng",
        province: "Free State",
        description: "New sewer network, water network, and upgraded roads.",
        status: "Active",
        beneficiaries: "Community Wide",
        period: "Ongoing",
        lat: -27.65,
        lng: 27.23
    },
    {
        id: "maokeng_x10_x13",
        name: "Maokeng X10 & X13",
        location: "Maokeng",
        province: "Free State",
        description: "Extensive sewer and water network implementation.",
        status: "Active",
        beneficiaries: "Thousands of residents",
        period: "Ongoing",
        lat: -27.66,
        lng: 27.24
    },
    {
        id: "majwemasweu",
        name: "Majwemasweu X1 & X5",
        location: "Majwemasweu",
        province: "Free State",
        description: "1,968 water meters, stand pipes, and sewer connections.",
        status: "Active",
        beneficiaries: "1,968 connection points",
        period: "Ongoing",
        lat: -28.31,
        lng: 26.62
    },
    {
        id: "intabazwe",
        name: "Intabazwe X2",
        location: "Intabazwe",
        province: "Free State",
        description: "17km sewer pipes, 12km water pipes, 879 water meters.",
        status: "Active",
        beneficiaries: "879 stands",
        period: "Ongoing",
        lat: -28.24,
        lng: 29.12
    },
    {
        id: "thubelihle",
        name: "Thubelihle X7 & X8",
        location: "Thubelihle",
        province: "Mpumalanga",
        description: "Gravel roads, stormwater drainage, and water distribution.",
        status: "Completed",
        beneficiaries: "Community Wide",
        period: "Completed",
        lat: -26.17,
        lng: 29.21
    },
    {
        id: "barkley_road",
        name: "Barkley Road",
        location: "Kimberley",
        province: "Northern Cape",
        description: "Internal gravel roads, water reticulation, and wastewater management.",
        status: "Active",
        beneficiaries: "1481 stands",
        period: "Target 2026",
        lat: -28.72,
        lng: 24.74
    },
    {
        id: "kathu_5700",
        name: "Kathu 5700",
        location: "Kathu",
        province: "Northern Cape",
        description: "Water and sewer reticulation for green field relocation.",
        status: "Active",
        beneficiaries: "Relocated Community",
        period: "Ongoing",
        lat: -27.69,
        lng: 23.05
    },
    {
        id: "jurgenskamp",
        name: "Jurgenskamp",
        location: "Internal Site",
        province: "Northern Cape",
        description: "Roads, sewerage, and water services.",
        status: "Completed",
        beneficiaries: "Community Wide",
        period: "Jan - May 2021",
        lat: -28.45,
        lng: 21.24
    }
];

// Additional projects
const additionalProjects = [
    { name: "Williston", lat: -31.34, lng: 20.91 },
    { name: "Dakota South", lat: -28.42, lng: 21.26 },
    { name: "Rosedale III", lat: -28.41, lng: 21.22 },
    { name: "Rosedale II", lat: -28.41, lng: 21.21 },
    { name: "Rosedale", lat: -28.41, lng: 21.20 },
    { name: "Goutrou", lat: -31.50, lng: 22.50 },
    { name: "Jacksonville", lat: -25.75, lng: 28.20 },
    { name: "Ivory Park", lat: -26.01, lng: 28.20 },
    { name: "eMpumelelweni X8 & X9", lat: -25.89, lng: 29.15 },
    { name: "Groblershoop", lat: -28.89, lng: 21.98 },
    { name: "Pabalello", lat: -28.42, lng: 21.22 },
    { name: "Britstown", lat: -30.59, lng: 23.51 },
    { name: "Smarties", lat: -28.43, lng: 21.24 },
    { name: "Paballelo North East", lat: -28.41, lng: 21.23 },
    { name: "Paballelo Makweta Valley", lat: -28.42, lng: 21.21 },
    { name: "Ganspan", lat: -27.95, lng: 24.78 },
    { name: "Calvinia", lat: -31.47, lng: 19.78 },
    { name: "Breipaal", lat: -29.65, lng: 22.74 },
    { name: "Gamakor", lat: -28.75, lng: 24.76 },
    { name: "Opwag", lat: -28.80, lng: 22.00 },
    { name: "Hlalanikahle Section L", lat: -25.87, lng: 29.12 },
    { name: "Hlalanikahle Section C", lat: -25.87, lng: 29.13 }
];

async function seedProjects() {
    console.log("Seeding GIC Master Project List with Coordinates...");

    for (const p of projects) {
        await setDoc(doc(db, "gic_projects", p.id), {
            ...p,
            timestamp: serverTimestamp()
        });
        console.log(`Seeded: ${p.name}`);
    }

    for (const p of additionalProjects) {
        const id = p.name.toLowerCase().replace(/\s+/g, "_").replace(/&/g, "and");
        await setDoc(doc(db, "gic_projects", id), {
            ...p,
            location: "Historical Site",
            province: "Multiple",
            status: "Completed",
            description: "Institutional civil services and community upliftment.",
            beneficiaries: "Various",
            timestamp: serverTimestamp()
        });
        process.stdout.write(".");
    }

    console.log("\nAll 36 GIC projects seeded successfully with mapping data.");
    process.exit(0);
}

seedProjects().catch(console.error);
