import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const TARGET_PARSER_VERSIONS = ["municipal-money-v3"];

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  await query(
    `
      delete from fact_infrastructure_projects_daily
      where day = current_date
    `
  );

  const insertResult = await query(
    `
      insert into fact_infrastructure_projects_daily (
        day,
        province,
        municipality,
        normalized_sector,
        project_count,
        projects_with_budget_count,
        high_value_project_count,
        new_build_count,
        upgrade_count,
        renewal_count,
        total_known_expenditure,
        avg_latest_amount
      )
      select
        current_date as day,
        province,
        coalesce(nullif(municipality, ''), 'Province Wide') as municipality,
        coalesce(nullif(normalized_sector, ''), 'Other') as normalized_sector,
        count(*)::int as project_count,
        count(*) filter (
          where coalesce(latest_amount, 0) > 0 or coalesce(total_known_expenditure, 0) > 0
        )::int as projects_with_budget_count,
        count(*) filter (
          where greatest(coalesce(latest_amount, 0), coalesce(total_known_expenditure, 0)) >= 10000000
        )::int as high_value_project_count,
        count(*) filter (where normalized_project_stage = 'New Build')::int as new_build_count,
        count(*) filter (where normalized_project_stage = 'Upgrade')::int as upgrade_count,
        count(*) filter (where normalized_project_stage = 'Renewal')::int as renewal_count,
        coalesce(sum(greatest(coalesce(total_known_expenditure, 0), 0)), 0)::numeric(18,2) as total_known_expenditure,
        round(avg(case when latest_amount > 0 then latest_amount end)::numeric, 2) as avg_latest_amount
      from infrastructure_projects
      where parser_version = any($1::text[])
        and status = 'active'
        and province is not null
        and coalesce(data_quality_flag, 'LOW') <> 'LOW'
      group by
        province,
        coalesce(nullif(municipality, ''), 'Province Wide'),
        coalesce(nullif(normalized_sector, ''), 'Other')
      on conflict (day, province, municipality, normalized_sector)
      do update set
        project_count = excluded.project_count,
        projects_with_budget_count = excluded.projects_with_budget_count,
        high_value_project_count = excluded.high_value_project_count,
        new_build_count = excluded.new_build_count,
        upgrade_count = excluded.upgrade_count,
        renewal_count = excluded.renewal_count,
        total_known_expenditure = excluded.total_known_expenditure,
        avg_latest_amount = excluded.avg_latest_amount
      returning province, municipality, normalized_sector, project_count
    `,
    [TARGET_PARSER_VERSIONS]
  );

  const summary = await query(
    `
      select
        province,
        count(*)::int as "factRows",
        sum(project_count)::int as "projectCount",
        sum(high_value_project_count)::int as "highValueProjectCount",
        round(sum(total_known_expenditure)::numeric, 2) as "totalKnownExpenditure"
      from fact_infrastructure_projects_daily
      where day = current_date
      group by province
      order by sum(project_count) desc, province asc
    `
  );

  console.log(
    JSON.stringify(
      {
        parserVersions: TARGET_PARSER_VERSIONS,
        insertedFactRows: insertResult.rowCount ?? 0,
        provinceSummary: summary.rows,
      },
      null,
      2
    )
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
