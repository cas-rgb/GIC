import { createRequire } from "module";
import { existsSync } from "fs";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows } = require("./election-import-utils") as typeof import("./election-import-utils");
const {
  municipalityCode,
  parseWardNumber,
  provinceCode,
  wardKey,
} = require("./place-reference-utils") as typeof import("./place-reference-utils");
const { VERIFIED_WARD_REFERENCE_SEEDS } = require("../src/data/enrichment/verified-reference-seeds") as typeof import("../src/data/enrichment/verified-reference-seeds");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function upsertCouncillor(input: {
  provinceName: string;
  municipalityName: string;
  wardName: string;
  councillorName: string;
  partyName: string | null;
  officeTitle: string | null;
  termStart: string | null;
  termEnd: string | null;
  sourceName: string;
  sourceUrl: string | null;
  verificationTier: string;
  confidenceScore: number | null;
  retrievedAt?: string | null;
}) {
  await query(
    `
      insert into ward_councillors (
        ward_key,
        ward_number,
        ward_name,
        municipality_code,
        municipality_name,
        province_code,
        province_name,
        councillor_name,
        party_name,
        office_title,
        term_start,
        term_end,
        source_name,
        source_url,
        verification_tier,
        confidence_score,
        retrieved_at
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,coalesce($17::timestamptz, now()))
      on conflict (province_name, municipality_name, ward_name, councillor_name, source_name)
      do update set
        party_name = excluded.party_name,
        office_title = excluded.office_title,
        term_start = excluded.term_start,
        term_end = excluded.term_end,
        source_url = excluded.source_url,
        verification_tier = excluded.verification_tier,
        confidence_score = excluded.confidence_score,
        retrieved_at = excluded.retrieved_at
    `,
    [
      wardKey(input.provinceName, input.municipalityName, input.wardName),
      parseWardNumber(input.wardName),
      input.wardName,
      municipalityCode(input.provinceName, input.municipalityName),
      input.municipalityName,
      provinceCode(input.provinceName),
      input.provinceName,
      input.councillorName,
      input.partyName,
      input.officeTitle,
      input.termStart,
      input.termEnd,
      input.sourceName,
      input.sourceUrl,
      input.verificationTier,
      input.confidenceScore,
      input.retrievedAt ?? null,
    ]
  );
}

async function main() {
  let seedUpserted = 0;
  let csvUpserted = 0;

  for (const seed of VERIFIED_WARD_REFERENCE_SEEDS) {
    if (!seed.councillorName) {
      continue;
    }

    await upsertCouncillor({
      provinceName: seed.province,
      municipalityName: seed.municipality,
      wardName: seed.ward,
      councillorName: seed.councillorName,
      partyName: seed.party,
      officeTitle: seed.officeTitle,
      termStart: null,
      termEnd: null,
      sourceName: seed.sourceName,
      sourceUrl: seed.sourceUrl,
      verificationTier: seed.verificationTier,
      confidenceScore: seed.confidenceScore,
      retrievedAt: seed.retrievedAt,
    });
    seedUpserted += 1;
  }

  const csvPath = "data/reference/councillors/ward_councillors.csv";
  if (existsSync(csvPath)) {
    const rows = await readCsvRows(csvPath);
    for (const row of rows) {
      const provinceName = row.province_name?.trim();
      const municipalityName = row.municipality_name?.trim();
      const wardName = row.ward_name?.trim();
      const councillorName = row.councillor_name?.trim();

      if (!provinceName || !municipalityName || !wardName || !councillorName) {
        continue;
      }

      await upsertCouncillor({
        provinceName,
        municipalityName,
        wardName,
        councillorName,
        partyName: row.party_name?.trim() || null,
        officeTitle: row.office_title?.trim() || "Ward Councillor",
        termStart: row.term_start?.trim() || null,
        termEnd: row.term_end?.trim() || null,
        sourceName: row.source_name?.trim() || "Ward councillor import",
        sourceUrl: row.source_url?.trim() || null,
        verificationTier: row.verification_tier?.trim() || "verified_enrichment",
        confidenceScore: row.confidence_score ? Number(row.confidence_score) : null,
        retrievedAt: row.retrieved_at?.trim() || null,
      });
      csvUpserted += 1;
    }
  }

  console.log(JSON.stringify({ seedUpserted, csvUpserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
