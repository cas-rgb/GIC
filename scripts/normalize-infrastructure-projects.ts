import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const TARGET_PARSER_VERSIONS = ["municipal-money-v3"];

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  const result = await query(
    `
      with normalized as (
        select
          id,
          case
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(water|sewer|sewerage|sanitation|wastewater|stormwater|effluent|reservoir|treatment works|water distribution|water supply)'
              then 'Water and Sanitation'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(road|street|bridge|traffic|transport|pavement|sidewalk|storm water|roads infrastructure|transport assets)'
              then 'Roads and Transport'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(electric|energy|substation|lighting|high mast|electrical infrastructure|power)'
              then 'Electricity and Energy'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(housing|settlement|residential|human settlements)'
              then 'Housing and Settlements'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(waste|landfill|refuse)'
              then 'Waste Management'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(computer|ict|information technology|digital|telecom|broadband|network)'
              then 'Digital and ICT'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(community|park|recreation|sport|sports|library|cemetery|facility|facilities|clinic|health|fire|public safety|building|operational buildings)'
              then 'Community Infrastructure'
            when lower(concat_ws(' ', asset_class, asset_subclass, function_name, project_description)) ~ '(finance|administrative|corporate support|asset management|machinery|equipment|fleet|office|stores|workshop)'
              then 'Municipal Operations'
            else 'Other'
          end as normalized_sector,
          case
            when project_type is null or btrim(project_type) = '' then 'Unspecified'
            when lower(project_type) = 'new' then 'New Build'
            when lower(project_type) like 'upgrad%' then 'Upgrade'
            when lower(project_type) like 'renew%' then 'Renewal'
            when lower(project_type) like 'maint%' then 'Maintenance'
            when lower(project_type) like 'rehabilit%' then 'Renewal'
            else initcap(lower(project_type))
          end as normalized_project_stage
        from infrastructure_projects
        where parser_version = any($1::text[])
      )
      update infrastructure_projects ip
      set
        normalized_sector = normalized.normalized_sector,
        normalized_project_stage = normalized.normalized_project_stage,
        data_quality_flag = case
          when ip.province is null or btrim(ip.province) = ''
            or (coalesce(btrim(ip.asset_class), '') = '' and coalesce(btrim(ip.function_name), '') = '')
            or coalesce(btrim(ip.function_name), '') = 'Z ???'
              then 'LOW'
          when ip.municipality is null
            or normalized.normalized_sector = 'Other'
            or normalized.normalized_project_stage = 'Unspecified'
              then 'MEDIUM'
          else 'OK'
        end,
        updated_at = now()
      from normalized
      where ip.id = normalized.id
      returning ip.id
    `,
    [TARGET_PARSER_VERSIONS]
  );

  const summary = await query(
    `
      select
        normalized_sector as "normalizedSector",
        normalized_project_stage as "normalizedProjectStage",
        data_quality_flag as "dataQualityFlag",
        count(*)::int as "projectCount"
      from infrastructure_projects
      where parser_version = any($1::text[])
      group by normalized_sector, normalized_project_stage, data_quality_flag
      order by count(*) desc, normalized_sector asc, normalized_project_stage asc
      limit 20
    `,
    [TARGET_PARSER_VERSIONS]
  );

  console.log(
    JSON.stringify(
      {
        parserVersions: TARGET_PARSER_VERSIONS,
        updatedProjects: result.rowCount ?? 0,
        topCombinations: summary.rows,
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
