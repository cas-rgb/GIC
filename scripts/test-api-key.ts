import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
let apiKey = '';
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && key.trim() === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
            apiKey = value.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

async function testKey() {
    if (!apiKey) {
        console.log("API Key not found in .env.local");
        process.exit(1);
    }
    console.log("Testing Key:", apiKey.substring(0, 5) + "...");
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ returnSecureToken: true }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testKey();
