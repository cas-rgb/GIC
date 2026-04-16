import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Import dynamically inside the function to ensure process.env.DATABASE_URL is loaded first.
const tier1Documents = [
  {
    title: "Emalahleni Water Treatment Plant Audit 2024",
    content: "The Emalahleni water treatment facility suffers from chronic motor failures and unspent maintenance budgets. Historically, this has led to a 40% reduction in clean water output, triggering recurring community demonstrations.",
    url: "https://gic.gov.za/vault/emalahleni-water-2024",
    source_name: "Auditor General Report"
  },
  {
    title: "Nelson Mandela Bay Transport Infrastructure Delay",
    content: "The Integrated Public Transport System (IPTS) in Nelson Mandela Bay has faced structural economic delays due to misaligned contractor payouts and vandalism of rapid bus stations.",
    url: "https://gic.gov.za/vault/nmb-transport-delay",
    source_name: "Treasury Transport Assessment"
  },
  {
    title: "Tshwane Electrical Grid Vulnerability Study",
    content: "Historical vulnerabilities in the Tshwane electrical grid are primarily located in the eastern and southern substations, where aging transformers have logged a 200% increase in blowout rates since 2021.",
    url: "https://gic.gov.za/vault/tshwane-grid",
    source_name: "Energy Regulatory Commission"
  },
  {
    title: "Johannesburg Inner City Housing Shortage 2023",
    content: "Affordable housing delivery in the Johannesburg inner city stalled in 2023 following the collapse of three major public-private partnerships. The structural backlog remains at critical levels.",
    url: "https://gic.gov.za/vault/joburg-housing",
    source_name: "Human Settlements Department"
  },
  {
    title: "Ethekwini Sewer Overflow Historical Context",
    content: "Post-flood damage in Ethekwini (Durban) permanently compromised three major coastal pump stations. The municipal repair backlog sits at 4 years, creating continuous environmental and public health threats.",
    url: "https://gic.gov.za/vault/ethekwini-sewer",
    source_name: "Water and Sanitation Bureau"
  }
];

export async function seedVaultDocuments() {
  console.log("Starting Tier 1 RAG Document Seeding...");
  const { query: pgQuery } = await import("../src/lib/db");
  const { generateEmbeddingVector } = await import("../src/ai-layer/vector-rag-service");

  for (const doc of tier1Documents) {
    try {
        // Ensure source exists or mock it
        const sourceRes = await pgQuery(
            `INSERT INTO sources (id, name, source_type, base_url, reliability_score) 
             VALUES (gen_random_uuid(), $1, 'gov', $2, 0.95) 
             ON CONFLICT DO NOTHING RETURNING id`, 
             [doc.source_name, "https://gic.gov.za"]
        );

        let sourceId = sourceRes.rows[0]?.id;
        if (!sourceId) {
            const existingSource = await pgQuery(`SELECT id FROM sources WHERE name = $1 LIMIT 1`, [doc.source_name]);
            sourceId = existingSource.rows[0]?.id;
        }

        if (sourceId) {
            await pgQuery(
                `INSERT INTO documents (id, source_id, url, title, content_text, doc_type, status, language, published_at, fetched_at, parser_version)
                 VALUES (gen_random_uuid(), $1, $2, $3, $4, 'report', 'active', 'en', current_timestamp, current_timestamp, '1.0')`,
                [sourceId, doc.url, doc.title, doc.content]
            );
            console.log(`Successfully seeded: ${doc.title}`);
        } else {
             console.log(`Failed to resolve source ID for: ${doc.title}`);
        }
    } catch (error) {
        console.error(`Failed to insert document ${doc.title}:`, error);
    }
  }

  console.log("RAG Vault Seeding Complete.");
}
// Automatically execute if run directly
if (typeof require !== 'undefined' && require.main === module) {
    seedVaultDocuments().then(() => process.exit(0)).catch(() => process.exit(1));
}
