import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, parseInteger, parseJsonObject, parseNumeric } = require("./demographics-import-utils") as typeof import("./demographics-import-utils");
const { provinceCode } = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const rows = await readCsvRows("data/reference/demographics/province_demographics_yearly.csv");
  let upserted = 0;

  for (const row of rows) {
    const provinceName = row.province_name?.trim();
    const year = parseInteger(row.year);

    if (!provinceName || year === null) {
      continue;
    }

    await query(
      `
        insert into province_demographics_yearly (
          province_code,
          province_name,
          year,
          population_total,
          households_total,
          unemployment_rate,
          income_band_summary,
          service_access_water,
          service_access_electricity,
          service_access_sanitation,
          language_profile,
          settlement_profile,
          economic_profile,
          source_name,
          source_url,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11::jsonb,$12::jsonb,$13::jsonb,$14,$15,now())
        on conflict (province_name, year)
        do update set
          population_total = excluded.population_total,
          households_total = excluded.households_total,
          unemployment_rate = excluded.unemployment_rate,
          income_band_summary = excluded.income_band_summary,
          service_access_water = excluded.service_access_water,
          service_access_electricity = excluded.service_access_electricity,
          service_access_sanitation = excluded.service_access_sanitation,
          language_profile = excluded.language_profile,
          settlement_profile = excluded.settlement_profile,
          economic_profile = excluded.economic_profile,
          source_name = excluded.source_name,
          source_url = excluded.source_url,
          retrieved_at = excluded.retrieved_at
      `,
      [
        provinceCode(provinceName),
        provinceName,
        year,
        parseInteger(row.population_total),
        parseInteger(row.households_total),
        parseNumeric(row.unemployment_rate),
        JSON.stringify(parseJsonObject(row.income_band_summary)),
        parseNumeric(row.service_access_water),
        parseNumeric(row.service_access_electricity),
        parseNumeric(row.service_access_sanitation),
        JSON.stringify(parseJsonObject(row.language_profile)),
        JSON.stringify(parseJsonObject(row.settlement_profile)),
        JSON.stringify(parseJsonObject(row.economic_profile)),
        row.source_name?.trim() || "Demographics import",
        row.source_url?.trim() || null,
      ]
    );
    upserted += 1;
  }

  console.log(JSON.stringify({ file: "province_demographics_yearly.csv", rowCount: rows.length, upserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
