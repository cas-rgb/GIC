import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function importFile(filePath: string, tableName: string) {
  const rows = await readCsvRows(filePath);
  let upserted = 0;

  for (const row of rows) {
    const provinceName = row.province_name?.trim();
    const summaryText = row.summary_text?.trim();

    if (!provinceName || !summaryText) {
      continue;
    }

    const values =
      tableName === "province_infrastructure_history"
        ? [
            provinceName,
            row.issue_family?.trim() || null,
            row.service_domain?.trim() || null,
            row.event_date?.trim() || null,
            optionalNumber(row.period_year),
            row.severity?.trim() || null,
            summaryText,
            row.source_name?.trim() || "Infrastructure history import",
            row.source_url?.trim() || null,
            row.verification_tier?.trim() || "verified_enrichment",
          ]
        : tableName === "municipality_infrastructure_history"
          ? [
              provinceName,
              row.municipality_name?.trim() || null,
              row.issue_family?.trim() || null,
              row.service_domain?.trim() || null,
              row.event_date?.trim() || null,
              optionalNumber(row.period_year),
              row.severity?.trim() || null,
              summaryText,
              row.source_name?.trim() || "Infrastructure history import",
              row.source_url?.trim() || null,
              row.verification_tier?.trim() || "verified_enrichment",
            ]
          : [
              provinceName,
              row.municipality_name?.trim() || null,
              row.ward_name?.trim() || null,
              row.issue_family?.trim() || null,
              row.service_domain?.trim() || null,
              row.event_date?.trim() || null,
              optionalNumber(row.period_year),
              row.severity?.trim() || null,
              summaryText,
              row.source_name?.trim() || "Infrastructure history import",
              row.source_url?.trim() || null,
              row.verification_tier?.trim() || "verified_enrichment",
            ];

    const deleteSql =
      tableName === "province_infrastructure_history"
        ? `
            delete from province_infrastructure_history
            where province_name = $1
              and issue_family is not distinct from $2
              and service_domain is not distinct from $3
              and event_date::text is not distinct from $4
              and period_year is not distinct from $5
              and severity is not distinct from $6
              and summary_text = $7
              and source_name = $8
              and source_url is not distinct from $9
              and verification_tier = $10
          `
        : tableName === "municipality_infrastructure_history"
          ? `
              delete from municipality_infrastructure_history
              where province_name = $1
                and municipality_name is not distinct from $2
                and issue_family is not distinct from $3
                and service_domain is not distinct from $4
                and event_date::text is not distinct from $5
                and period_year is not distinct from $6
                and severity is not distinct from $7
                and summary_text = $8
                and source_name = $9
                and source_url is not distinct from $10
                and verification_tier = $11
            `
          : `
              delete from ward_infrastructure_history
              where province_name = $1
                and municipality_name is not distinct from $2
                and ward_name is not distinct from $3
                and issue_family is not distinct from $4
                and service_domain is not distinct from $5
                and event_date::text is not distinct from $6
                and period_year is not distinct from $7
                and severity is not distinct from $8
                and summary_text = $9
                and source_name = $10
                and source_url is not distinct from $11
                and verification_tier = $12
            `;

    const insertSql =
      tableName === "province_infrastructure_history"
        ? `
            insert into province_infrastructure_history (
              province_name, issue_family, service_domain, event_date, period_year, severity,
              summary_text, source_name, source_url, verification_tier, retrieved_at
            )
            values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
          `
        : tableName === "municipality_infrastructure_history"
          ? `
              insert into municipality_infrastructure_history (
                province_name, municipality_name, issue_family, service_domain, event_date, period_year, severity,
                summary_text, source_name, source_url, verification_tier, retrieved_at
              )
              values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
            `
          : `
              insert into ward_infrastructure_history (
                province_name, municipality_name, ward_name, issue_family, service_domain, event_date, period_year, severity,
                summary_text, source_name, source_url, verification_tier, retrieved_at
              )
              values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
            `;

    await query(deleteSql, values);
    await query(insertSql, values);
    upserted += 1;
  }

  return { rowCount: rows.length, upserted };
}

async function main() {
  const province = await importFile(
    "data/reference/history/province_infrastructure_history.csv",
    "province_infrastructure_history"
  );
  const municipality = await importFile(
    "data/reference/history/municipality_infrastructure_history.csv",
    "municipality_infrastructure_history"
  );
  const ward = await importFile(
    "data/reference/history/ward_infrastructure_history.csv",
    "ward_infrastructure_history"
  );

  console.log(JSON.stringify({ province, municipality, ward }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
