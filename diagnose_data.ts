
import { db } from './src/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function diagnose() {
    const collections = ['tenders', 'riskSignals', 'planningBudgets', 'communities'];
    
    for (const col of collections) {
        console.log(`\n--- Collection: ${col} ---`);
        try {
            const snapshot = await getDocs(query(collection(db, col), limit(5)));
            if (snapshot.empty) {
                console.log('Empty collection.');
                continue;
            }
            
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                console.log(`ID: ${doc.id}`);
                console.log(`Municipality: ${data.municipality || 'MISSING'}`);
                console.log(`Ward: ${data.ward || 'MISSING'}`);
                console.log(`Province: ${data.province || 'MISSING'}`);
                console.log(`Keys: ${Object.keys(data).join(', ')}`);
                console.log('----------------');
            });
        } catch (e: any) {
            console.error(`Error reading ${col}:`, e.message);
        }
    }
}

diagnose().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
