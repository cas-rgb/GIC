import { createRequire } from "module";

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, limit, query } from "firebase/firestore";

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

async function main() {
  const collectionName = process.argv[2];
  const sampleSize = Number(process.argv[3] ?? "3");

  if (!collectionName) {
    throw new Error("usage: node ... sample-firestore-collection.ts <collectionName> [sampleSize]");
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(query(collection(db, collectionName), limit(sampleSize)));

  console.log(
    JSON.stringify(
      {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        collectionName,
        sampleSize,
        documents: snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })),
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
