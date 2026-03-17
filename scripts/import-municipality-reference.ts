import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const {
  loadContextualReferenceFile,
  municipalityCode,
  provinceCode,
} = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const contextual = await loadContextualReferenceFile();
  const municipalities = contextual.profiles
    .filter(
      (profile) =>
        profile.geographyLevel === "municipality" &&
        profile.province &&
        profile.municipality
    )
    .map((profile) => ({
      provinceName: profile.province as string,
      municipalityName: profile.municipality as string,
    }))
    .sort((left, right) =>
      `${left.provinceName}|${left.municipalityName}`.localeCompare(
        `${right.provinceName}|${right.municipalityName}`
      )
    );

  const deduped = new Map<string, { provinceName: string; municipalityName: string }>();
  for (const item of municipalities) {
    deduped.set(`${item.provinceName}|${item.municipalityName}`, item);
  }

  let upserted = 0;

  for (const item of deduped.values()) {
    await query(
      `
        insert into municipality_reference (
          municipality_code,
          municipality_name,
          municipality_category,
          district_name,
          province_code,
          province_name,
          source_name,
          source_url
        )
        values ($1, $2, null, null, $3, $4, $5, $6)
        on conflict (municipality_code)
        do update set
          municipality_name = excluded.municipality_name,
          province_code = excluded.province_code,
          province_name = excluded.province_name,
          source_name = excluded.source_name,
          source_url = excluded.source_url
      `,
      [
        municipalityCode(item.provinceName, item.municipalityName),
        item.municipalityName,
        provinceCode(item.provinceName),
        item.provinceName,
        "Contextual reference bootstrap",
        "data/enrichment/contextual-reference-profiles.json",
      ]
    );
    upserted += 1;
  }

  console.log(
    JSON.stringify(
      {
        source: "contextual-reference-profiles.json",
        municipalityCount: deduped.size,
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
