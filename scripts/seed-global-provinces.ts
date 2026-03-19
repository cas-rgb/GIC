import { loadEnv } from './load-env-cli';
loadEnv();

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, writeBatch, Timestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const TARGETS = [
  { province: "KwaZulu-Natal", municipalities: ["eThekwini", "Msunduzi", "Newcastle"] },
  { province: "Eastern Cape", municipalities: ["Nelson Mandela Bay", "Buffalo City", "OR Tambo"] },
  { province: "Limpopo", municipalities: ["Polokwane", "Thulamela", "Makhado"] },
  { province: "Mpumalanga", municipalities: ["Mbombela", "eMalahleni", "Steve Tshwete"] },
  { province: "North West", municipalities: ["Rustenburg", "Mahikeng", "JB Marks"] },
  { province: "Free State", municipalities: ["Mangaung", "Matjhabeng", "Metsimaholo"] },
  { province: "Northern Cape", municipalities: ["Sol Plaatje", "Dawid Kruiper", "Nama Khoi"] },
  { province: "Gauteng", municipalities: ["Johannesburg", "Tshwane", "Ekurhuleni"] },
  { province: "Western Cape", municipalities: ["Cape Town", "Stellenbosch", "George"] }
];

const DOMAINS = ["Water Infrastructure", "Electricity Supply", "Roads and Transport", "Healthcare", "Waste Management", "Housing", "Safety and Security"];
const CATEGORIES = ["Civil", "Structural", "Roads", "Town Planning", "Health"];
const SENTIMENTS = ["Negative", "Mixed", "Positive"];

function randomChoice(arr: any[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBoolean(chance = 0.5) { return Math.random() < chance; }

async function seedGlobalMesh() {
  console.log("🚀 Starting Global Provincial Data Mesh Seeding (Injected Client SDK Mode)...");
  
  const batch = writeBatch(db);
  let count = 0;

  for (const target of TARGETS) {
    console.log(`Generating matrix for ${target.province}...`);
    
    // Generate 8 Community Issues per province
    for (let i = 0; i < 8; i++) {
      const syntheticId = `civic-issue-${target.province.substring(0,2).toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
      const issueRef = doc(collection(db, "community_issue"), syntheticId);
      const domain = randomChoice(DOMAINS);
      const muni = randomChoice(target.municipalities);
      
      batch.set(issueRef, {
        id: syntheticId,
        province: target.province,
        municipality: muni,
        primary_topic: domain,
        issue_category: randomChoice(CATEGORIES),
        sentiment: randomChoice(SENTIMENTS),
        urgency: randomChoice(["Low", "Medium", "High", "Critical"]),
        affected_service_area: `${domain} Network Segment ${Math.floor(Math.random() * 10)}`,
        citizen_concern_indicator: randomBoolean(0.7),
        government_priority_indicator: randomBoolean(0.4),
        budget_related_indicator: randomBoolean(0.6),
        confidence: 0.6 + (Math.random() * 0.38),
        tavily_result_id: `synthetic-${syntheticId}`,
        source_title: `Generated OSINT Signal: ${domain} strain observed in ${muni}`,
        status: "active",
        country: "South Africa",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      count++;
    }

    // Generate 6 Service Pressure Cases per province
    for (let i = 0; i < 6; i++) {
        const pId = `pressure-case-${target.province.substring(0,2).toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
        const pressureRef = doc(collection(db, "service_pressure_case"), pId);
        const domain = randomChoice(DOMAINS);
        const muni = randomChoice(target.municipalities);
        
        batch.set(pressureRef, {
            id: pId,
            sourceId: `synthetic-src-${Math.floor(Math.random() * 1000)}`,
            province: target.province,
            municipality: muni,
            serviceDomain: domain,
            pressureType: randomChoice(["Outage", "Access Failure", "Backlog", "Degradation"]),
            issueCategory: `${domain} Failure`,
            sentiment: "Negative",
            urgency: randomChoice(["Medium", "High", "Critical"]),
            severity: randomChoice(["Medium", "High", "Critical"]),
            citizenPressureIndicator: true,
            serviceFailureIndicator: true,
            protestIndicator: randomBoolean(0.3),
            responseIndicator: randomBoolean(0.2),
            recurrenceIndicator: randomBoolean(0.8),
            infrastructureIndicator: true,
            classificationConfidence: 0.8 + (Math.random() * 0.19),
            publishedDate: new Date().toISOString(),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        count++;
    }

    // Generate Budget Allocations (3 major domains) per province
    const budgetDomains = ["Water Infrastructure", "Electricity Supply", "Roads and Transport"];
    for (const bDomain of budgetDomains) {
        const key = `${target.province}_${bDomain.replace(/\\s+/g, '_')}`;
        const budgetRef = doc(collection(db, "provincial_budget_allocation"), key);
        
        batch.set(budgetRef, {
            id: key,
            province: target.province,
            budget_topic: bDomain,
            allocation_amount: Math.floor(Math.random() * 5000000000) + 500000000,
            allocation_percentage: Math.floor(Math.random() * 15) + 5,
            fiscal_year: "2025/26",
            priority_level: "High",
            confidence: 1.0,
            status: "active",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        count++;
    }
  }

  await batch.commit();
  console.log(`✅ Success! Injected ${count} hyper-realistic nodes across all 9 provinces.`);
}

seedGlobalMesh().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
