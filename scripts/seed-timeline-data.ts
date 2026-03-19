import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';
import path from 'path';

// Provide absolute path so `dotenv` resolves correctly regardless of CWD.
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Avoid initializing multiple apps if script re-runs or hot-reloads
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountKey) {
  console.error("FATAL: FIREBASE_SERVICE_ACCOUNT_KEY is missing from .env.local");
  process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountKey);
const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", 
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

function generateHistoricalCurves() {
   const curves = [];
   const mockNow = new Date();
   
   for (const province of PROVINCES) {
      // Create 30 days of data
      let baseScore = 40 + Math.random() * 20;
      for (let i = 30; i >= 0; i--) {
         const d = new Date(mockNow.getTime());
         d.setDate(d.getDate() - i);
         
         // Random walk
         baseScore = Math.max(10, Math.min(90, baseScore + (Math.random() * 10 - 5)));
         
         curves.push({
             province,
             dateStamp: d.toISOString().split('T')[0],
             sentimentScore: Math.round(baseScore),
             mentionVolume: Math.floor(Math.random() * 500) + 100,
             type: "daily_sentiment_velocity",
             updatedAt: FieldValue.serverTimestamp()
         });
      }
   }
   
   return curves;
}

async function seedTimelineData() {
    console.log("Starting backfill for historical sentiment curves...");
    const batch = db.batch();
    const timelineRef = db.collection("analytics_timeline_series");
    
    let opData = generateHistoricalCurves();
    let count = 0;
    
    for (const record of opData) {
       const docRef = timelineRef.doc();
       batch.set(docRef, record);
       count++;
       
       if (count % 400 === 0) {
          await batch.commit();
          console.log(`Committed ${count} timeline records...`);
       }
    }
    
    if (count % 400 !== 0) {
       await batch.commit();
    }
    
    console.log(`Successfully backfilled ${count} historical curves via seed-timeline-data.ts.`);
}

seedTimelineData().then(() => process.exit(0)).catch(err => {
   console.error(err);
   process.exit(1);
});
