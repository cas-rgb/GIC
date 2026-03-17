import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const rows = await readCsvRows("data/reference/history/budget_allocations.csv");
  let upserted = 0;

  for (const row of rows) {
    const geographyLevel = row.geography_level?.trim();
    const provinceName = row.province_name?.trim();

    if (!geographyLevel || !provinceName) {
      continue;
    }

    const values = [
      geographyLevel,
      provinceName,
      row.municipality_name?.trim() || null,
      row.ward_name?.trim() || null,
      row.issue_family?.trim() || null,
      row.service_domain?.trim() || null,
      optionalNumber(row.period_year),
      optionalNumber(row.budget_amount),
      row.project_name?.trim() || null,
      row.project_status?.trim() || null,
      row.summary_text?.trim() || "",
      row.source_name?.trim() || "Budget import",
      row.source_url?.trim() || null,
      row.verification_tier?.trim() || "verified_enrichment",
    ];

    await query(
      `
        delete from budget_allocations
        where geography_level = $1
          and province_name = $2
          and municipality_name is not distinct from $3
          and ward_name is not distinct from $4
          and issue_family is not distinct from $5
          and service_domain is not distinct from $6
          and period_year is not distinct from $7
          and budget_amount is not distinct from $8
          and project_name is not distinct from $9
          and project_status is not distinct from $10
          and summary_text = $11
          and source_name = $12
          and source_url is not distinct from $13
          and verification_tier = $14
      `,
      values
    );

    await query(
      `
        insert into budget_allocations (
          geography_level,
          province_name,
          municipality_name,
          ward_name,
          issue_family,
          service_domain,
          period_year,
          budget_amount,
          project_name,
          project_status,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())
      `,
      values
    );
    upserted += 1;
  }

  console.log(JSON.stringify({ file: "budget_allocations.csv", rowCount: rows.length, upserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
