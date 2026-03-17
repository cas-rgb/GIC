import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const {
  cleanWardName,
  loadContextualReferenceFile,
  municipalityCode,
  parseWardNumber,
  provinceCode,
  wardKey,
} = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const contextual = await loadContextualReferenceFile();
  const deduped = new Map<
    string,
    {
      provinceName: string;
      municipalityName: string;
      wardName: string;
      wardNumber: number | null;
    }
  >();

  for (const row of contextual.wardCoverage) {
    const provinceName = row.province?.trim();
    const municipalityName = row.municipality?.trim();
    const wardName = cleanWardName(row.ward ?? "");

    if (!provinceName || !municipalityName || !wardName) {
      continue;
    }

    const key = `${provinceName}|${municipalityName}|${wardName}`;
    if (!deduped.has(key)) {
      deduped.set(key, {
        provinceName,
        municipalityName,
        wardName,
        wardNumber: parseWardNumber(wardName),
      });
    }
  }

  let upserted = 0;

  for (const row of deduped.values()) {
    await query(
      `
        insert into ward_reference (
          ward_key,
          ward_number,
          ward_name,
          municipality_code,
          municipality_name,
          district_name,
          province_code,
          province_name,
          boundary_ref,
          source_name,
          source_url
        )
        values ($1, $2, $3, $4, $5, null, $6, $7, null, $8, $9)
        on conflict (ward_key)
        do update set
          ward_number = excluded.ward_number,
          ward_name = excluded.ward_name,
          municipality_code = excluded.municipality_code,
          municipality_name = excluded.municipality_name,
          province_code = excluded.province_code,
          province_name = excluded.province_name,
          source_name = excluded.source_name,
          source_url = excluded.source_url
      `,
      [
        wardKey(row.provinceName, row.municipalityName, row.wardName),
        row.wardNumber,
        row.wardName,
        municipalityCode(row.provinceName, row.municipalityName),
        row.municipalityName,
        provinceCode(row.provinceName),
        row.provinceName,
        "Contextual ward coverage bootstrap",
        "data/enrichment/contextual-reference-profiles.json",
      ]
    );
    upserted += 1;
  }

  console.log(
    JSON.stringify(
      {
        source: "contextual-reference-profiles.json",
        wardCount: deduped.size,
        upserted,
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
