import { createRequire } from "module";

import { initializeApp } from "firebase/app";
import { collection, getCountFromServer, getDocs, getFirestore, limit, query } from "firebase/firestore";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const COLLECTIONS = [
  "community_signals",
  "planningBudgets",
  "tenders",
  "leaders",
  "leadership",
  "location_resolved_signal",
  "riskSignals",
  "strategicDatasets",
] as const;

async function inspectCollection(db: ReturnType<typeof getFirestore>, name: string) {
  try {
    const ref = collection(db, name);
    const count = await getCountFromServer(ref);
    const sample = await getDocs(query(ref, limit(1)));
    const first = sample.docs[0];
    const sampleKeys = first ? Object.keys(first.data()).sort() : [];

    return {
      name,
      ok: true,
      count: count.data().count,
      sampleId: first?.id ?? null,
      sampleKeys,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const results = [];
  for (const name of COLLECTIONS) {
    results.push(await inspectCollection(db, name));
  }

  console.log(
    JSON.stringify(
      {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        inspectedAt: new Date().toISOString(),
        collections: results,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
