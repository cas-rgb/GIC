import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const API_SOURCE_NAME = "Municipal Money Infrastructure API";
const API_SOURCE_URL = "https://municipalmoney.gov.za/api/v1/infrastructure/projects/";
const SNAPSHOT_LIMIT = 1000;
const SNAPSHOT_OFFSETS = [0, 1000, 2000, 3000, 4000, 5000];

function deriveProjectName(project: {
  geography?: { name?: string };
  project_description?: string;
  asset_class?: string;
  function?: string;
  project_number?: string;
}): string {
  const geographicLabel = project.geography?.name ?? "Municipal";
  const subject =
    project.project_description?.trim() ||
    project.asset_class?.trim() ||
    project.function?.trim() ||
    "Infrastructure Project";
  const projectNumber = project.project_number?.trim();

  return [geographicLabel, subject, projectNumber].filter(Boolean).join(" - ");
}

function toNumeric(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeProvinceName(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value.replace("Kwazulu-Natal", "KwaZulu-Natal");
}

async function ensureApiSource(
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ id: string }> }>
): Promise<string> {
  const existing = await query(
    `
      select id
      from sources
      where name = $1
      limit 1
    `,
    [API_SOURCE_NAME]
  );

  if (existing.rows[0]) {
    await query(
      `
        update sources
        set
          source_type = 'treasury',
          base_url = $2,
          reliability_score = 0.950,
          active = true,
          updated_at = now()
        where id = $1
      `,
      [existing.rows[0].id, API_SOURCE_URL]
    );

    return existing.rows[0].id;
  }

  const inserted = await query(
    `
      insert into sources (name, source_type, base_url, reliability_score, active)
      values ($1, 'treasury', $2, 0.950, true)
      returning id
    `,
    [API_SOURCE_NAME, API_SOURCE_URL]
  );

  return inserted.rows[0].id;
}

async function createSnapshotDocument(
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<{ id: string }> }>,
  sourceId: string,
  offset: number,
  projects: Array<any>
): Promise<string> {
  const { createHash } = require("crypto");
  const provinces = Array.from(
    new Set(
      projects
        .map((project) => normalizeProvinceName(project.geography?.province_name))
        .filter(Boolean)
    )
  ).sort();

  const title = `Municipal Money Infrastructure Snapshot Offset ${offset}`;
  const contentText = [
    `Source: Municipal Money Infrastructure API`,
    `Snapshot offset: ${offset}`,
    `Snapshot limit: ${SNAPSHOT_LIMIT}`,
    `Project count: ${projects.length}`,
    provinces.length > 0 ? `Provinces in snapshot: ${provinces.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const contentHash = createHash("sha256")
    .update(`${title}\n${contentText}`)
    .digest("hex");

  const existing = await query(
    `
      select id
      from documents
      where content_hash = $1
      limit 1
    `,
    [contentHash]
  );

  if (existing.rows[0]) {
    return existing.rows[0].id;
  }

  const inserted = await query(
    `
      insert into documents (
        source_id,
        url,
        title,
        published_at,
        fetched_at,
        doc_type,
        language,
        content_text,
        content_hash,
        parser_version,
        status
      )
      values ($1, $2, $3, now(), now(), 'report', 'en', $4, $5, 'municipal-money-v3', 'active')
      returning id
    `,
    [
      sourceId,
      `${API_SOURCE_URL}?limit=${SNAPSHOT_LIMIT}&offset=${offset}`,
      title,
      contentText,
      contentHash,
    ]
  );

  return inserted.rows[0].id;
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  async function markAttempt(sourceId: string) {
    await query(
      `
        update sources
        set
          last_attempted_at = now(),
          updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  async function markFailure(sourceId: string, error: string) {
    await query(
      `
        update sources
        set
          last_error = $2,
          updated_at = now()
        where id = $1
      `,
      [sourceId, error.slice(0, 500)]
    );
  }

  async function markSuccess(sourceId: string) {
    await query(
      `
        update sources
        set
          last_ingested_at = now(),
          last_error = null,
          updated_at = now()
        where id = $1
      `,
      [sourceId]
    );
  }

  const sourceId = await ensureApiSource(query);
  await markAttempt(sourceId);

  await query(`delete from project_funding_sources where source_document_id in (select id from documents where parser_version = 'municipal-money-v2')`);
  await query(`delete from project_updates where source_document_id in (select id from documents where parser_version = 'municipal-money-v2')`);
  await query(`delete from project_funding_sources where infrastructure_project_id in (select id from infrastructure_projects where parser_version in ('municipal-money-v2', 'municipal-money-v3'))`);
  await query(`delete from project_updates where infrastructure_project_id in (select id from infrastructure_projects where parser_version in ('municipal-money-v2', 'municipal-money-v3'))`);
  await query(`delete from infrastructure_projects where parser_version in ('municipal-money-v2', 'municipal-money-v3')`);
  await query(`delete from documents where parser_version in ('municipal-money-v2', 'municipal-money-v3')`);

  const results = [];

  for (const offset of SNAPSHOT_OFFSETS) {
    const response = await fetch(`${API_SOURCE_URL}?limit=${SNAPSHOT_LIMIT}&offset=${offset}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      await markFailure(sourceId, `fetch failed: ${response.status}`);
      results.push({
        offset,
        insertedProjects: 0,
        errors: [`fetch failed: ${response.status}`],
      });
      continue;
    }

    const payload = (await response.json()) as {
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<any>;
    };

    const documentId = await createSnapshotDocument(query, sourceId, offset, payload.results);

    let insertedProjects = 0;

    for (const rawProject of payload.results) {
      const province = normalizeProvinceName(rawProject.geography?.province_name);
      if (!province) {
        continue;
      }

      const district =
        rawProject.geography?.geo_level === "district"
          ? rawProject.geography?.name ?? null
          : rawProject.geography?.parent_level === "district"
            ? rawProject.geography?.parent_code ?? null
            : null;
      const municipality =
        rawProject.geography?.geo_level === "municipality"
          ? rawProject.geography?.name ?? null
          : null;
      const ward = rawProject.ward_location ?? null;
      const locationKey = ["South Africa", province, district ?? "", municipality ?? "", ward ?? ""].join("|");

      const locationResult = await query(
        `
          insert into locations (country, province, district, municipality, ward, location_key)
          values ('South Africa', $1, $2, $3, $4, $5)
          on conflict (location_key)
          do update set
            province = excluded.province,
            district = excluded.district,
            municipality = excluded.municipality,
            ward = excluded.ward
          returning id
        `,
        [province, district, municipality, ward, locationKey]
      );

      const locationId = locationResult.rows[0].id as string;
      const projectId = String(rawProject.id);
      const expenditures = Array.isArray(rawProject.expenditure) ? rawProject.expenditure : [];
      const latestExpenditure = expenditures[0] ?? null;
      const latestAmount = toNumeric(latestExpenditure?.amount ?? null);
      const totalKnownExpenditure = expenditures.reduce((sum: number, entry: { amount?: string | number | null }) => {
        const numeric = toNumeric(entry.amount ?? null);
        return numeric === null ? sum : sum + numeric;
      }, 0);

      const insertedProject = await query(
        `
          insert into infrastructure_projects (
            source_id,
            document_id,
            location_id,
            external_project_id,
            project_number,
            project_name,
            province,
            municipality,
            district,
            geography_level,
            function_name,
            asset_class,
            asset_subclass,
            project_type,
            project_description,
            ward_location,
            municipality_category,
            latest_budget_year,
            latest_budget_phase,
            latest_amount,
            total_known_expenditure,
            source_url,
            parser_version,
            status,
            raw_payload
          )
          values (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, 'municipal-money-v3', 'active', $23::jsonb
          )
          on conflict (external_project_id)
          do update set
            source_id = excluded.source_id,
            document_id = excluded.document_id,
            location_id = excluded.location_id,
            project_number = excluded.project_number,
            project_name = excluded.project_name,
            province = excluded.province,
            municipality = excluded.municipality,
            district = excluded.district,
            geography_level = excluded.geography_level,
            function_name = excluded.function_name,
            asset_class = excluded.asset_class,
            asset_subclass = excluded.asset_subclass,
            project_type = excluded.project_type,
            project_description = excluded.project_description,
            ward_location = excluded.ward_location,
            municipality_category = excluded.municipality_category,
            latest_budget_year = excluded.latest_budget_year,
            latest_budget_phase = excluded.latest_budget_phase,
            latest_amount = excluded.latest_amount,
            total_known_expenditure = excluded.total_known_expenditure,
            source_url = excluded.source_url,
            parser_version = excluded.parser_version,
            status = excluded.status,
            raw_payload = excluded.raw_payload,
            updated_at = now()
          returning id
        `,
        [
          sourceId,
          documentId,
          locationId,
          projectId,
          rawProject.project_number ?? null,
          deriveProjectName(rawProject),
          province,
          municipality,
          district,
          rawProject.geography?.geo_level ?? null,
          rawProject.function ?? null,
          rawProject.asset_class ?? null,
          rawProject.asset_subclass ?? null,
          rawProject.project_type ?? null,
          rawProject.project_description ?? null,
          ward,
          rawProject.geography?.category ?? null,
          rawProject.latest_implementation_year?.budget_year ?? null,
          latestExpenditure?.budget_phase?.name ?? null,
          latestAmount,
          totalKnownExpenditure || null,
          `${API_SOURCE_URL}?limit=${SNAPSHOT_LIMIT}&offset=${offset}`,
          JSON.stringify({
            offset,
            sourceName: API_SOURCE_NAME,
            project: rawProject,
          }),
        ]
      );

      const infrastructureProjectId = insertedProject.rows[0].id as string;

      await query(`delete from project_funding_sources where infrastructure_project_id = $1`, [
        infrastructureProjectId,
      ]);
      await query(`delete from project_updates where infrastructure_project_id = $1`, [
        infrastructureProjectId,
      ]);

      for (const expenditure of expenditures) {
        const amount = toNumeric(expenditure.amount ?? null);
        if (amount === null) {
          continue;
        }

        await query(
          `
            insert into project_funding_sources (
              infrastructure_project_id,
              financial_year,
              budget_phase,
              amount,
              source_document_id,
              raw_payload
            )
            values ($1, $2, $3, $4, $5, $6::jsonb)
          `,
          [
            infrastructureProjectId,
            expenditure.financial_year?.budget_year ?? null,
            expenditure.budget_phase?.name ?? null,
            amount,
            documentId,
            JSON.stringify(expenditure),
          ]
        );
      }

      await query(
        `
          insert into project_updates (
            infrastructure_project_id,
            source_document_id,
            update_type,
            update_summary,
            effective_date,
            raw_payload
          )
          values ($1, $2, 'catalog_snapshot', $3, now(), $4::jsonb)
        `,
        [
          infrastructureProjectId,
          documentId,
          `${deriveProjectName(rawProject)} captured from Municipal Money API offset ${offset}`,
          JSON.stringify({
            offset,
            latestBudgetYear: rawProject.latest_implementation_year?.budget_year ?? null,
            latestBudgetPhase: latestExpenditure?.budget_phase?.name ?? null,
            latestAmount,
          }),
        ]
      );

      insertedProjects += 1;
    }

    const provinceCountResult = await query(
      `
        select count(distinct province)::int as province_count
        from infrastructure_projects
        where parser_version = 'municipal-money-v3'
      `
    );

    results.push({
      offset,
      fetchedProjects: payload.results.length,
      insertedProjects,
      provinceCoverage: provinceCountResult.rows[0]?.province_count ?? 0,
      errors: [],
    });
  }

  const failedResult = results.find(
    (result: { errors?: string[] }) => (result.errors ?? []).length > 0
  );

  if (failedResult) {
    await markFailure(sourceId, failedResult.errors[0]);
  } else {
    await markSuccess(sourceId);
  }

  console.log(JSON.stringify(results, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
