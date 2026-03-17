import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function dedupeTable(tableName: string, partitionSql: string) {
  const result = await query<{ deleted_count: number }>(
    `
      with ranked as (
        select
          id,
          row_number() over (
            partition by ${partitionSql}
            order by retrieved_at desc, id desc
          ) as row_rank
        from ${tableName}
      ),
      deleted as (
        delete from ${tableName}
        where id in (
          select id
          from ranked
          where row_rank > 1
        )
        returning 1
      )
      select count(*)::int as deleted_count from deleted
    `
  );

  return Number(result.rows[0]?.deleted_count ?? 0);
}

async function main() {
  const deleted = {
    budgetAllocations: await dedupeTable(
      "budget_allocations",
      "geography_level, province_name, coalesce(municipality_name, ''), coalesce(ward_name, ''), coalesce(issue_family, ''), coalesce(service_domain, ''), coalesce(period_year, -1), coalesce(budget_amount, -1), coalesce(project_name, ''), coalesce(project_status, ''), coalesce(summary_text, ''), source_name, coalesce(source_url, ''), verification_tier"
    ),
    provinceInfrastructureHistory: await dedupeTable(
      "province_infrastructure_history",
      "province_name, coalesce(issue_family, ''), coalesce(service_domain, ''), coalesce(event_date::text, ''), coalesce(period_year, -1), coalesce(severity, ''), summary_text, source_name, coalesce(source_url, ''), verification_tier"
    ),
    municipalityInfrastructureHistory: await dedupeTable(
      "municipality_infrastructure_history",
      "province_name, municipality_name, coalesce(issue_family, ''), coalesce(service_domain, ''), coalesce(event_date::text, ''), coalesce(period_year, -1), coalesce(severity, ''), summary_text, source_name, coalesce(source_url, ''), verification_tier"
    ),
    wardInfrastructureHistory: await dedupeTable(
      "ward_infrastructure_history",
      "province_name, municipality_name, ward_name, coalesce(issue_family, ''), coalesce(service_domain, ''), coalesce(event_date::text, ''), coalesce(period_year, -1), coalesce(severity, ''), summary_text, source_name, coalesce(source_url, ''), verification_tier"
    ),
    historicalIssueEvents: await dedupeTable(
      "historical_issue_events",
      "geography_level, province_name, coalesce(municipality_name, ''), coalesce(ward_name, ''), coalesce(issue_family, ''), coalesce(service_domain, ''), coalesce(event_date::text, ''), coalesce(period_year, -1), coalesce(severity, ''), summary_text, source_name, coalesce(source_url, ''), verification_tier"
    ),
  };

  console.log(JSON.stringify({ deleted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
