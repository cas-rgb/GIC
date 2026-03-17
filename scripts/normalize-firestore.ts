import { db } from "../src/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { NormalizationUtility } from "../src/utils/normalization-utility";

async function normalizeExistingData() {
    console.log("[MIGRATION] Starting GIC Strategic Normalization...");
    const collections = ['riskSignals', 'tenders', 'communities', 'planningBudgets'];
    
    let totalProcessed = 0;
    let totalNormalized = 0;

    for (const colName of collections) {
        console.log(`\nProcessing collection: ${colName}`);
        const snap = await getDocs(collection(db, colName));
        
        for (const d of snap.docs) {
            const data = d.data();
            const { province, municipality } = NormalizationUtility.normalizeRegion(
                data.province || '', 
                data.municipality || ''
            );
            
            const updates: any = {};
            if (province !== data.province) updates.province = province;
            if (municipality !== data.municipality) updates.municipality = municipality;
            
            // Normalized Sector
            if (data.category && typeof data.category === 'string') {
                const normSector = NormalizationUtility.normalizeSector(data.category);
                if (normSector !== data.category) updates.category = normSector;
            } else if (!data.category) {
                updates.category = 'Structural';
            }

            // Normalized Domain
            const currentDomain = data.domain || '';
            const normDomain = NormalizationUtility.normalizeDomain(currentDomain);
            const fallbackDomain = 
                (colName === 'tenders' || colName === 'planningBudgets') ? 'Commercial' : 
                (colName === 'riskSignals') ? 'Social' : 'Infrastructure';
            
            if (normDomain !== currentDomain || !data.domain) {
                updates.domain = normDomain || fallbackDomain;
            }

            // Normalized Source Type
            const currentSource = data.sourceType || data.source_type || 'GIC Intelligence';
            const normSource = NormalizationUtility.normalizeSource(currentSource);
            if (normSource !== currentSource || (!data.sourceType && data.source_type)) {
                updates.sourceType = normSource;
            }

            if (Object.keys(updates).length > 0) {
                await updateDoc(doc(db, colName, d.id), updates);
                totalNormalized++;
                console.log(`  [UPDATED] ${d.id}: ${data.municipality} -> ${municipality} | Domain: ${updates.domain}`);
            }
            totalProcessed++;
        }
    }

    console.log(`\n[MIGRATION COMPLETE]`);
    console.log(`Total Docs Processed: ${totalProcessed}`);
    console.log(`Total Docs Normalized: ${totalNormalized}`);
}

normalizeExistingData().catch(console.error);
