import { query } from "@/lib/db";
import {
  InfrastructureProjectGeographyRow,
  InfrastructureProjectsSummaryResponse,
  InfrastructureProjectSectorRow,
} from "@/lib/analytics/types";

interface SnapshotDateRow {
  snapshotDate: string | null;
}

interface ProjectQualityRow {
  rawProjectCount: number;
  screenedOutProjectCount: number;
}

interface ProjectSummaryRow {
  screenedProjectCount: number;
  projectsWithBudgetCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: string | number;
  avgLatestAmount: string | number | null;
}

interface ProjectSectorRowDb {
  normalizedSector: string;
  projectCount: number;
  projectsWithBudgetCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: string | number;
  avgLatestAmount: string | number | null;
}

interface ProjectGeographyRowDb {
  geography: string;
  projectCount: number;
  projectsWithBudgetCount: number;
  highValueProjectCount: number;
  totalKnownExpenditure: string | number;
  avgLatestAmount: string | number | null;
  dominantSector: string | null;
}

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === "string" ? Number(value) : value;
}

function mapSectorRow(row: ProjectSectorRowDb): InfrastructureProjectSectorRow {
  return {
    ...row,
    totalKnownExpenditure: toNumber(row.totalKnownExpenditure) ?? 0,
    avgLatestAmount: toNumber(row.avgLatestAmount),
  };
}

function mapGeographyRow(
  row: ProjectGeographyRowDb
): InfrastructureProjectGeographyRow {
  return {
    ...row,
    totalKnownExpenditure: toNumber(row.totalKnownExpenditure) ?? 0,
    avgLatestAmount: toNumber(row.avgLatestAmount),
  };
}

export async function getInfrastructureProjectsSummary(
  province?: string | null
): Promise<InfrastructureProjectsSummaryResponse> {
  const snapshotResult = await query<SnapshotDateRow>(
    `
      select max(day)::text as "snapshotDate"
      from fact_infrastructure_projects_daily
    `
  );

  const snapshotDate = snapshotResult.rows[0]?.snapshotDate ?? null;

  if (!snapshotDate) {
    return {
      snapshotDate: null,
      province: province ?? null,
      summary: {
        rawProjectCount: 0,
        screenedProjectCount: 0,
        screenedOutProjectCount: 0,
        projectsWithBudgetCount: 0,
        highValueProjectCount: 0,
        totalKnownExpenditure: 0,
        avgLatestAmount: null,
        topSector: null,
      },
      sectorBreakdown: [],
      geographyRows: [],
      caveats: [
        "No infrastructure project fact rows are available yet.",
      ],
      trace: {
        tables: ["fact_infrastructure_projects_daily", "infrastructure_projects"],
        query: province ? `province=${province}` : "province=all",
      },
    };
  }

  const [qualityResult, summaryResult, sectorResult, geographyResult] =
    await Promise.all([
      query<ProjectQualityRow>(
        `
          select
            count(*)::int as "rawProjectCount",
            count(*) filter (where coalesce(data_quality_flag, 'LOW') = 'LOW')::int as "screenedOutProjectCount"
          from infrastructure_projects
          where parser_version = 'municipal-money-v3'
            and status = 'active'
            and province is not null
            and ($1::text is null or province = $1)
        `,
        [province ?? null]
      ),
      query<ProjectSummaryRow>(
        `
          select
            coalesce(sum(project_count), 0)::int as "screenedProjectCount",
            coalesce(sum(projects_with_budget_count), 0)::int as "projectsWithBudgetCount",
            coalesce(sum(high_value_project_count), 0)::int as "highValueProjectCount",
            coalesce(round(sum(total_known_expenditure)::numeric, 2), 0) as "totalKnownExpenditure",
            round(avg(avg_latest_amount)::numeric, 2) as "avgLatestAmount"
          from fact_infrastructure_projects_daily
          where day = $1::date
            and ($2::text is null or province = $2)
        `,
        [snapshotDate, province ?? null]
      ),
      query<ProjectSectorRowDb>(
        `
          select
            normalized_sector as "normalizedSector",
            sum(project_count)::int as "projectCount",
            sum(projects_with_budget_count)::int as "projectsWithBudgetCount",
            sum(high_value_project_count)::int as "highValueProjectCount",
            round(sum(total_known_expenditure)::numeric, 2) as "totalKnownExpenditure",
            round(avg(avg_latest_amount)::numeric, 2) as "avgLatestAmount"
          from fact_infrastructure_projects_daily
          where day = $1::date
            and ($2::text is null or province = $2)
          group by normalized_sector
          order by sum(project_count) desc, normalized_sector asc
        `,
        [snapshotDate, province ?? null]
      ),
      query<ProjectGeographyRowDb>(
        `
          with grouped as (
            select
              case
                when $2::text is null then province
                else municipality
              end as geography,
              normalized_sector,
              sum(project_count)::int as project_count,
              sum(projects_with_budget_count)::int as projects_with_budget_count,
              sum(high_value_project_count)::int as high_value_project_count,
              round(sum(total_known_expenditure)::numeric, 2) as total_known_expenditure,
              round(avg(avg_latest_amount)::numeric, 2) as avg_latest_amount
            from fact_infrastructure_projects_daily
            where day = $1::date
              and ($2::text is null or province = $2)
            group by 1, normalized_sector
          ),
          ranked as (
            select
              *,
              row_number() over (
                partition by geography
                order by project_count desc, normalized_sector asc
              ) as sector_rank
            from grouped
          )
          select
            geography,
            sum(project_count)::int as "projectCount",
            sum(projects_with_budget_count)::int as "projectsWithBudgetCount",
            sum(high_value_project_count)::int as "highValueProjectCount",
            round(sum(total_known_expenditure)::numeric, 2) as "totalKnownExpenditure",
            round(avg(avg_latest_amount)::numeric, 2) as "avgLatestAmount",
            max(normalized_sector) filter (where sector_rank = 1) as "dominantSector"
          from ranked
          group by geography
          order by sum(project_count) desc, geography asc
          limit 12
        `,
        [snapshotDate, province ?? null]
      ),
    ]);

  const quality = qualityResult.rows[0] ?? {
    rawProjectCount: 0,
    screenedOutProjectCount: 0,
  };
  const summary = summaryResult.rows[0] ?? {
    screenedProjectCount: 0,
    projectsWithBudgetCount: 0,
    highValueProjectCount: 0,
    totalKnownExpenditure: 0,
    avgLatestAmount: null,
  };
  const sectorBreakdown = sectorResult.rows.map(mapSectorRow);
  const geographyRows = geographyResult.rows.map(mapGeographyRow);

  return {
    snapshotDate,
    province: province ?? null,
    summary: {
      rawProjectCount: quality.rawProjectCount,
      screenedProjectCount: summary.screenedProjectCount,
      screenedOutProjectCount: quality.screenedOutProjectCount,
      projectsWithBudgetCount: summary.projectsWithBudgetCount,
      highValueProjectCount: summary.highValueProjectCount,
      totalKnownExpenditure: toNumber(summary.totalKnownExpenditure) ?? 0,
      avgLatestAmount: toNumber(summary.avgLatestAmount),
      topSector: sectorBreakdown[0]?.normalizedSector ?? null,
    },
    sectorBreakdown,
    geographyRows,
    caveats: [
      "Infrastructure project coverage currently comes from balanced Municipal Money API snapshots, not a full project export.",
      "Low-quality Treasury rows are screened out of the fact table before aggregation.",
    ],
    trace: {
      tables: ["fact_infrastructure_projects_daily", "infrastructure_projects"],
      query: province
        ? `snapshotDate=${snapshotDate};province=${province}`
        : `snapshotDate=${snapshotDate};province=all`,
    },
  };
}
