const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, limit, query } = require("firebase/firestore");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};

envContent.split("\n").forEach((line) => {
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

async function inspect() {
  const snap = await getDocs(query(collection(db, "community_signals"), limit(5)));
  const rows = snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

inspect().catch((error) => {
  console.error(error);
  process.exit(1);
});
