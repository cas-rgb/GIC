import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { loadContextualReferenceFile, provinceCode } = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const contextual = await loadContextualReferenceFile();
  const provinces = Array.from(
    new Set(
      contextual.profiles
        .filter((profile) => profile.geographyLevel === "province" && profile.province)
        .map((profile) => profile.province as string)
    )
  ).sort((left, right) => left.localeCompare(right));

  let upserted = 0;

  for (const provinceName of provinces) {
    await query(
      `
        insert into province_reference (
          province_code,
          province_name,
          source_name,
          source_url
        )
        values ($1, $2, $3, $4)
        on conflict (province_code)
        do update set
          province_name = excluded.province_name,
          source_name = excluded.source_name,
          source_url = excluded.source_url
      `,
      [
        provinceCode(provinceName),
        provinceName,
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
        provinceCount: provinces.length,
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
