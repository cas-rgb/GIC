import { query as pgQuery } from "@/lib/db";
import { processMineDeepSocialJob } from "@/lib/jobs/mine-deep-social-handler";

export async function fetchRecentSocialDocuments(
  days: number = 30, 
  province: string = "All Provinces", 
  municipality: string = "All Municipalities", 
  domain: string = "all"
) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  // For raw docs (YouTube/Articles), we filter by date as baseline
  let docsRes = await pgQuery(`
    SELECT title, published_at, url, doc_type as source_name 
    FROM documents 
    WHERE created_at >= $1
    ORDER BY created_at DESC 
    LIMIT 30
  `, [cutoffStr]);

  // For narratives, we map exactly to the new OSINT matrix schema
  let narrativeQuery = `
    SELECT title, description, threat_level, source_platform, province, created_at
    FROM social_narratives
    WHERE created_at >= $1
  `;
  const params: any[] = [cutoffStr];
  let paramIdx = 2;

  if (province !== "All Provinces") {
    narrativeQuery += ` AND province = $${paramIdx}`;
    params.push(province);
    paramIdx++;
  }
  
  // Note: Depending on OSINT implementation, if municipality binding exists in social_narratives, add it here.
  // For now, service category is highly relevant. Add it if column exists (omitted if 'all').

  narrativeQuery += ` ORDER BY created_at DESC LIMIT 60`;

  let narrativesRes = await pgQuery(narrativeQuery, params);

  // [JIT INGESTION HOOK] If the database has 0 historical entries for this region, execute the OSINT pipeline immediately
  if (docsRes.rows.length === 0 && narrativesRes.rows.length === 0) {
    console.log(`[Social Trends] Zero data found for ${province} - ${municipality}. Triggering dynamic ingestion hook...`);
    try {
      await processMineDeepSocialJob({ province, municipality: municipality !== "All Municipalities" ? municipality : undefined });
      
      // Re-query PostgreSQL post-ingestion
      docsRes = await pgQuery(`
        SELECT title, published_at, url, doc_type as source_name 
        FROM documents 
        WHERE created_at >= $1
        ORDER BY created_at DESC 
        LIMIT 30
      `, [cutoffStr]);
      narrativesRes = await pgQuery(narrativeQuery, params);
    } catch (err) {
      console.error("OSINT JIT Generation Error for Social Trends:", err);
    }
  }

  return {
    rawDocs: docsRes.rows || [],
    rawNarratives: narrativesRes.rows || []
  };
}
