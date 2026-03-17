import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const rows = await readCsvRows("data/reference/history/historical_issue_events.csv");
  let upserted = 0;

  for (const row of rows) {
    const geographyLevel = row.geography_level?.trim();
    const provinceName = row.province_name?.trim();
    const summaryText = row.summary_text?.trim();

    if (!geographyLevel || !provinceName || !summaryText) {
      continue;
    }

    const values = [
      geographyLevel,
      provinceName,
      row.municipality_name?.trim() || null,
      row.ward_name?.trim() || null,
      row.issue_family?.trim() || null,
      row.service_domain?.trim() || null,
      row.event_date?.trim() || null,
      optionalNumber(row.period_year),
      row.severity?.trim() || null,
      summaryText,
      row.source_name?.trim() || "Historical issue import",
      row.source_url?.trim() || null,
      row.verification_tier?.trim() || "verified_enrichment",
    ];

    await query(
      `
        delete from historical_issue_events
        where geography_level = $1
          and province_name = $2
          and municipality_name is not distinct from $3
          and ward_name is not distinct from $4
          and issue_family is not distinct from $5
          and service_domain is not distinct from $6
          and event_date::text is not distinct from $7
          and period_year is not distinct from $8
          and severity is not distinct from $9
          and summary_text = $10
          and source_name = $11
          and source_url is not distinct from $12
          and verification_tier = $13
      `,
      values
    );

    await query(
      `
        insert into historical_issue_events (
          geography_level,
          province_name,
          municipality_name,
          ward_name,
          issue_family,
          service_domain,
          event_date,
          period_year,
          severity,
          summary_text,
          source_name,
          source_url,
          verification_tier,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now())
      `,
      values
    );
    upserted += 1;
  }

  console.log(JSON.stringify({ file: "historical_issue_events.csv", rowCount: rows.length, upserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
