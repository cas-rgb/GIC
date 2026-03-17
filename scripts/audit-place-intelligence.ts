import { createRequire } from "module";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { Client } from "pg";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli") as typeof import("./load-env-cli");

loadEnv();

async function countTable(client: Client, tableName: string): Promise<number> {
  const result = await client.query<{ count: number }>(
    `select count(*)::int as count from ${tableName}`
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();

  const totals = {
    provinceReference: await countTable(client, "province_reference"),
    municipalityReference: await countTable(client, "municipality_reference"),
    wardReference: await countTable(client, "ward_reference"),
    provinceDemographics: await countTable(client, "province_demographics_yearly"),
    municipalityDemographics: await countTable(client, "municipality_demographics_yearly"),
    wardDemographics: await countTable(client, "ward_demographics_yearly"),
    provinceElectionResults: await countTable(client, "province_election_results"),
    municipalityElectionResults: await countTable(client, "municipality_election_results"),
    wardElectionResults: await countTable(client, "ward_election_results"),
    wardCouncillors: await countTable(client, "ward_councillors"),
    budgetAllocations: await countTable(client, "budget_allocations"),
    provinceInfrastructureHistory: await countTable(client, "province_infrastructure_history"),
    municipalityInfrastructureHistory: await countTable(client, "municipality_infrastructure_history"),
    wardInfrastructureHistory: await countTable(client, "ward_infrastructure_history"),
    historicalIssueEvents: await countTable(client, "historical_issue_events"),
  };

  const provinceCoverage = await client.query<{
    province_name: string;
    municipality_reference_count: number;
    ward_reference_count: number;
    municipality_demographics_count: number;
    municipality_election_count: number;
    ward_councillor_count: number;
    municipality_history_count: number;
    ward_history_count: number;
    ward_event_count: number;
  }>(`
    select
      p.province_name,
      (
        select count(*)::int
        from municipality_reference mr
        where mr.province_name = p.province_name
      ) as municipality_reference_count,
      (
        select count(*)::int
        from ward_reference wr
        where wr.province_name = p.province_name
      ) as ward_reference_count,
      (
        select count(*)::int
        from municipality_demographics_yearly md
        where md.province_name = p.province_name
      ) as municipality_demographics_count,
      (
        select count(*)::int
        from municipality_election_results mer
        where mer.province_name = p.province_name
      ) as municipality_election_count,
      (
        select count(*)::int
        from ward_councillors wc
        where wc.province_name = p.province_name
      ) as ward_councillor_count,
      (
        select count(*)::int
        from municipality_infrastructure_history mih
        where mih.province_name = p.province_name
      ) as municipality_history_count,
      (
        select count(*)::int
        from ward_infrastructure_history wih
        where wih.province_name = p.province_name
      ) as ward_history_count,
      (
        select count(*)::int
        from historical_issue_events hie
        where hie.province_name = p.province_name
          and hie.geography_level = 'ward'
      ) as ward_event_count
    from province_reference p
    order by p.province_name
  `);

  const report = {
    generatedAt: new Date().toISOString(),
    totals,
    provinces: provinceCoverage.rows,
  };

  const outputDir = path.join(process.cwd(), "data", "audits");
  mkdirSync(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, "place-intelligence-coverage-audit.json");
  writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify(report, null, 2));
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
