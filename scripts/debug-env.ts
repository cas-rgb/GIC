import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log("CWD:", process.cwd());
console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "EXISTS" : "MISSING");
console.log("PROJECT ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
