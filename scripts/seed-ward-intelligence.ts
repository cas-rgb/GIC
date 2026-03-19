import { createRequire } from "module";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

// Initialise Gemini
const apiKey = process.env.VERTEX_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-3-flash-preview", generationConfig: { responseMimeType: "application/json" } });

// Initialise Firebase
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

// Seed target definition
const TARGETS = [
  { municipality: "City of Johannesburg", province: "Gauteng", wards: [1, 2, 87, 88, 130] },
  { municipality: "eThekwini", province: "KwaZulu-Natal", wards: [1, 10, 27, 33, 101] },
  { municipality: "City of Cape Town", province: "Western Cape", wards: [1, 54, 76, 115] },
  { municipality: "City of Tshwane", province: "Gauteng", wards: [1, 42, 69] }
];

const PROMPT_TEMPLATE = `
You are an expert geospatial and civic intelligence analyst mapping South African municipal subdivisions.
Generate a strictly formatted JSON profile for Ward {WARD_NUMBER} falling within the {MUNICIPALITY} Metropolitan Municipality ({PROVINCE}).

If exact granular data for this specific ward is unavailable, synthesize highly realistic, contextually accurate ethnographic and geographic parameters typical for the regions encompassing that municipality and ward numbering scheme.

The output MUST perfectly adhere to this JSON structure:
{
  "wardId": "{MUNICIPALITY}_Ward_{WARD_NUMBER}",
  "municipality": "{MUNICIPALITY}",
  "wardNumber": "{WARD_NUMBER}",
  "mapParameters": {
    "centerLat": -26.2041, // Generate a plausible latitude within the municipality
    "centerLng": 28.0473,  // Generate a plausible longitude within the municipality
    "radiusMeters": 3500, // Appropriate size for the ward density
    "boundaryType": "Urban Grid" // Urban Grid, Peri-Urban, Rural Sprawl, etc.
  },
  "demographics": {
    "populationDensity": "High / Medium / Low",
    "primaryLanguage": "isiZulu / English / etc",
    "secondaryLanguage": "...",
    "medianAge": 28
  },
  "culture": {
    "heritageProfile": "Brief description of cultural history or heritage groups dominant in the area",
    "communityStructures": "e.g., Traditional leadership presence, active neighborhood watches, religious dominance"
  },
  "voting": {
    "dominantParty": "ANC / DA / EFF / IFP / ActionSA",
    "voterTurnoutPercent": 55.4,
    "politicalVolatility": "Stable / Contested / Volatile"
  },
  "weather": {
    "climateBaseline": "Subtropical / Semi-arid / Mediterranean",
    "primaryClimateRisk": "Flash Flooding / Heatwaves / Drought"
  },
  "crime": {
    "safetyIndex": 45, // 0-100 scale (100 being safest)
    "primarySyndicateOrThreat": "e.g., Cable Theft Syndicates, Construction Mafias, Gang Violence, Petty Theft"
  },
  "socioEconomicStats": {
    "unemploymentPercent": 34.2,
    "medianIncomeBracket": "Low Income / Lower-Middle / Upper-Middle / High Net Worth",
    "primaryEconomicDriver": "Retail / Industrial Manufacturing / Informal Economy / Services"
  }
}
`;

async function seedWard(municipality: string, province: string, wardNumber: number) {
  const wardString = `Ward ${wardNumber}`;
  console.log(`  🧠 Generating Deep Intelligence for ${municipality} - ${wardString}...`);
  
  const prompt = PROMPT_TEMPLATE
    .replace(/{MUNICIPALITY}/g, municipality)
    .replace(/{PROVINCE}/g, province)
    .replace(/{WARD_NUMBER}/g, wardNumber.toString());

  try {
    const result = await geminiFlash.generateContent(prompt);
    let data;
    try {
        data = JSON.parse(result.response.text());
    } catch (e) {
        throw new Error("Failed to parse Gemini JSON output");
    }

    if (!data || !data.mapParameters) {
      throw new Error("Invalid schema generated.");
    }

    const docId = `${municipality.replace(/ /g, "_")}_Ward_${wardNumber}`;
    
    // Write to Firestore collection 'wardIntelligence'
    await setDoc(doc(db, "wardIntelligence", docId), {
      ...data,
      lastUpdated: new Date().toISOString()
    });

    console.log(`  ✅ Stored deep intelligence for ${docId}.`);

  } catch (e) {
    console.error(`  ❌ Seeding failed for ${municipality} Ward ${wardNumber}`, e);
  }
}

async function runSeeder() {
  console.log("🚀 Starting Autonomous Ward Intelligence Seeder");
  
  for (const target of TARGETS) {
    console.log(`n📍 Processing Municipality: ${target.municipality}`);
    for (const wardNumber of target.wards) {
      await seedWard(target.municipality, target.province, wardNumber);
      // Wait to respect Vertex AI rate limits
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  console.log("n✅ Ward Intelligence Seeder execution completed.");
  process.exit(0);
}

runSeeder().catch((e) => {
  console.error("Fatal Error:", e);
  process.exit(1);
});
