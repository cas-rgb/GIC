import { db } from '../src/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env.local loader
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

async function verify() {
    const provinces = ['Western Cape', 'North West', 'Mpumalanga', 'Eastern Cape', 'Gauteng'];
    console.log("Verifying collections...");

    for (const province of provinces) {
        const q = query(collection(db, "community_issue"), where('province', '==', province));
        const snap = await getDocs(q);
        console.log(`${province}: ${snap.size} issues found.`);
    }
    process.exit(0);
}

verify();
