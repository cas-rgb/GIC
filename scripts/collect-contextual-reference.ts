import * as fs from "fs";
import * as path from "path";
import { createRequire } from "module";

import type { QueryResultRow } from "pg";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

type GeographyLevel = "province" | "municipality";

interface GeographyRow extends QueryResultRow {
  province: string;
  municipality: string | null;
}

interface WardSummaryRow extends QueryResultRow {
  province: string;
  municipality: string;
  ward: string;
  documentCount: number;
  pressureCaseCount: number;
  sentimentMentionCount: number;
}

interface MunicipalitySummaryRow extends QueryResultRow {
  province: string;
  municipality: string;
  knownWardCount: number;
  evidenceBackedWardCount: number;
}

interface GeocodePoint {
  latitude: number;
  longitude: number;
  elevation: number | null;
  timezone: string | null;
}

interface WeatherSnapshot {
  temperatureC: number | null;
  windSpeedKmh: number | null;
  weatherCode: number | null;
  observedAt: string | null;
}

interface ReferenceProfile {
  geographyLevel: GeographyLevel;
  province: string;
  municipality: string | null;
  wikipediaTitle: string | null;
  wikipediaDescription: string | null;
  wikipediaExtract: string | null;
  wikipediaUrl: string | null;
  storyAngles: string[];
  tags: string[];
  geocode: GeocodePoint | null;
  weather: WeatherSnapshot | null;
  knownWardCount: number;
  evidenceBackedWardCount: number;
}

interface CollectionOutput {
  generatedAt: string;
  profiles: ReferenceProfile[];
  wardCoverage: Array<{
    province: string;
    municipality: string;
    ward: string;
    documentCount: number;
    pressureCaseCount: number;
    sentimentMentionCount: number;
    evidenceBacked: boolean;
  }>;
}

const OUTPUT_DIR = path.resolve(process.cwd(), "data", "enrichment");
const OUTPUT_PATH = path.join(OUTPUT_DIR, "contextual-reference-profiles.json");

const STORY_RULES: Array<{ tag: string; pattern: RegExp }> = [
  { tag: "culture", pattern: /\bculture\b|\bheritage\b|\blanguage\b|\bcommunity\b/i },
  { tag: "economy", pattern: /\beconomy\b|\beconomic\b|\btrade\b|\bindustr/i },
  { tag: "politics", pattern: /\bpolitic/i },
  { tag: "demographics", pattern: /\bpopulation\b|\bdemographic/i },
  { tag: "tourism", pattern: /\btourism\b|\bvisitor/i },
  { tag: "agriculture", pattern: /\bagricultur/i },
  { tag: "mining", pattern: /\bmining\b|\bminerals?\b/i },
  { tag: "manufacturing", pattern: /\bmanufactur/i },
  { tag: "port-logistics", pattern: /\bport\b|\blogistics\b|\btransport hub\b/i },
  { tag: "climate-risk", pattern: /\bclimate\b|\bdrought\b|\bflood\b|\bstorm\b/i },
  { tag: "governance", pattern: /\bmunicipality\b|\bgovernment\b|\bcouncil\b/i },
];

function pause(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "gic-app-enrichment/1.0",
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function buildStoryAngles(text: string): string[] {
  const matches = STORY_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.tag);
  return unique(matches);
}

function buildTags(profile: {
  province: string;
  municipality: string | null;
  weather: WeatherSnapshot | null;
  storyAngles: string[];
}): string[] {
  const tags = [
    profile.province,
    profile.municipality ?? null,
    ...profile.storyAngles,
  ].filter((value): value is string => Boolean(value));

  if (profile.weather?.weatherCode !== null && profile.weather?.weatherCode !== undefined) {
    tags.push(`weather-code-${profile.weather.weatherCode}`);
  }

  return unique(tags);
}

function municipalityTitleCandidates(municipality: string): string[] {
  return unique([
    municipality,
    `${municipality} Local Municipality`,
    `${municipality} Metropolitan Municipality`,
    municipality.replace(/^City of /i, ""),
    municipality.replace(/^City of /i, "") + " Metropolitan Municipality",
  ]);
}

async function resolveWikipediaTitle(searchTerm: string): Promise<string | null> {
  const payload = await fetchJson<[string, string[], string[], string[]]>(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      searchTerm
    )}&limit=5&namespace=0&format=json&origin=*`
  );

  if (!payload || !Array.isArray(payload[1]) || payload[1].length === 0) {
    return null;
  }

  return payload[1][0] ?? null;
}

async function getWikipediaSummary(candidateTitles: string[]): Promise<{
  title: string | null;
  description: string | null;
  extract: string | null;
  url: string | null;
}> {
  for (const candidate of candidateTitles) {
    const resolvedTitle = await resolveWikipediaTitle(candidate);
    const titleToUse = resolvedTitle ?? candidate;
    const payload = await fetchJson<{
      title?: string;
      description?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      type?: string;
    }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(titleToUse)}`
    );

    if (!payload || payload.type === "https://mediawiki.org/wiki/HyperSwitch/errors/not_found") {
      continue;
    }

    if (!payload.extract && !payload.description) {
      continue;
    }

    return {
      title: payload.title ?? titleToUse,
      description: payload.description ?? null,
      extract: payload.extract ?? null,
      url: payload.content_urls?.desktop?.page ?? null,
    };
  }

  return {
    title: null,
    description: null,
    extract: null,
    url: null,
  };
}

async function getGeocode(name: string): Promise<GeocodePoint | null> {
  const payload = await fetchJson<{
    results?: Array<{
      latitude: number;
      longitude: number;
      elevation?: number;
      timezone?: string;
    }>;
  }>(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      name
    )}&count=1&language=en&format=json`
  );

  const point = payload?.results?.[0];
  if (!point) {
    return null;
  }

  return {
    latitude: point.latitude,
    longitude: point.longitude,
    elevation: point.elevation ?? null,
    timezone: point.timezone ?? null,
  };
}

async function getWeather(point: GeocodePoint): Promise<WeatherSnapshot | null> {
  const payload = await fetchJson<{
    current?: {
      time?: string;
      temperature_2m?: number;
      wind_speed_10m?: number;
      weather_code?: number;
    };
  }>(
    `https://api.open-meteo.com/v1/forecast?latitude=${point.latitude}&longitude=${point.longitude}&current=temperature_2m,wind_speed_10m,weather_code&timezone=auto`
  );

  if (!payload?.current) {
    return null;
  }

  return {
    temperatureC: payload.current.temperature_2m ?? null,
    windSpeedKmh: payload.current.wind_speed_10m ?? null,
    weatherCode: payload.current.weather_code ?? null,
    observedAt: payload.current.time ?? null,
  };
}

async function getMunicipalitySummaries(): Promise<Map<string, MunicipalitySummaryRow>> {
  const result = await query<MunicipalitySummaryRow>(
    `
      with base_wards as (
        select
          province,
          municipality,
          ward
        from locations
        where province is not null
          and municipality is not null
          and ward is not null
          and btrim(ward) <> ''
      ),
      ward_evidence as (
        select
          l.province,
          l.municipality,
          l.ward,
          count(distinct d.id)::int as document_count,
          count(distinct si.id)::int as pressure_case_count,
          count(distinct sm.id)::int as sentiment_count
        from locations l
        left join documents d
          on d.location_id = l.id
         and d.status = 'active'
        left join service_incidents si
          on si.location_id = l.id
        left join sentiment_mentions sm
          on sm.location_id = l.id
        where l.province is not null
          and l.municipality is not null
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.province, l.municipality, l.ward
      )
      select
        bw.province,
        bw.municipality,
        count(*)::int as "knownWardCount",
        count(*) filter (
          where coalesce(we.document_count, 0) + coalesce(we.pressure_case_count, 0) + coalesce(we.sentiment_count, 0) > 0
        )::int as "evidenceBackedWardCount"
      from base_wards bw
      left join ward_evidence we
        on we.province = bw.province
       and we.municipality = bw.municipality
       and we.ward = bw.ward
      group by bw.province, bw.municipality
    `
  );

  return new Map(
    result.rows.map((row) => [`${row.province}||${row.municipality}`, row])
  );
}

async function getWardRows(): Promise<WardSummaryRow[]> {
  const result = await query<WardSummaryRow>(
    `
      with base as (
        select distinct province, municipality, ward
        from locations
        where province is not null
          and municipality is not null
          and ward is not null
          and btrim(ward) <> ''
      ),
      doc_counts as (
        select
          l.province,
          l.municipality,
          l.ward,
          count(distinct d.id)::int as document_count
        from locations l
        join documents d
          on d.location_id = l.id
         and d.status = 'active'
        where l.province is not null
          and l.municipality is not null
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.province, l.municipality, l.ward
      ),
      pressure_counts as (
        select
          l.province,
          l.municipality,
          l.ward,
          count(*)::int as pressure_case_count
        from locations l
        join service_incidents si on si.location_id = l.id
        where l.province is not null
          and l.municipality is not null
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.province, l.municipality, l.ward
      ),
      sentiment_counts as (
        select
          l.province,
          l.municipality,
          l.ward,
          count(*)::int as sentiment_count
        from locations l
        join sentiment_mentions sm on sm.location_id = l.id
        where l.province is not null
          and l.municipality is not null
          and l.ward is not null
          and btrim(l.ward) <> ''
        group by l.province, l.municipality, l.ward
      )
      select
        base.province,
        base.municipality,
        base.ward,
        coalesce(doc_counts.document_count, 0)::int as "documentCount",
        coalesce(pressure_counts.pressure_case_count, 0)::int as "pressureCaseCount",
        coalesce(sentiment_counts.sentiment_count, 0)::int as "sentimentMentionCount"
      from base
      left join doc_counts
        on doc_counts.province = base.province
       and doc_counts.municipality = base.municipality
       and doc_counts.ward = base.ward
      left join pressure_counts
        on pressure_counts.province = base.province
       and pressure_counts.municipality = base.municipality
       and pressure_counts.ward = base.ward
      left join sentiment_counts
        on sentiment_counts.province = base.province
       and sentiment_counts.municipality = base.municipality
       and sentiment_counts.ward = base.ward
      order by base.province asc, base.municipality asc, base.ward asc
    `
  );

  return result.rows;
}

async function getGeographies(): Promise<GeographyRow[]> {
  const result = await query<GeographyRow>(
    `
      with provinces as (
        select distinct province, null::text as municipality
        from locations
        where province is not null
        union
        select distinct province, null::text as municipality
        from source_registry
        where province is not null
      ),
      municipalities as (
        select distinct province, municipality
        from locations
        where province is not null
          and municipality is not null
        union
        select distinct province, municipality
        from source_registry
        where province is not null
          and municipality is not null
          and active = true
      )
      select province, municipality
      from (
        select * from provinces
        union
        select * from municipalities
      ) combined
      order by province asc, municipality asc nulls first
    `
  );

  return result.rows;
}

async function buildProfile(
  row: GeographyRow,
  municipalitySummaries: Map<string, MunicipalitySummaryRow>
): Promise<ReferenceProfile> {
  const geographyLevel: GeographyLevel = row.municipality ? "municipality" : "province";
  const candidateTitles =
    geographyLevel === "province"
      ? [row.province]
      : municipalityTitleCandidates(row.municipality as string);

  const wikipedia = await getWikipediaSummary(candidateTitles);
  await pause(300);

  const geocodeName = row.municipality ? `${row.municipality}, ${row.province}, South Africa` : `${row.province}, South Africa`;
  const geocode = await getGeocode(geocodeName);
  await pause(300);
  const weather = geocode ? await getWeather(geocode) : null;

  const municipalitySummary = row.municipality
    ? municipalitySummaries.get(`${row.province}||${row.municipality}`)
    : null;
  const storyCorpus = [wikipedia.description, wikipedia.extract].filter(Boolean).join("\n");
  const storyAngles = buildStoryAngles(storyCorpus);

  return {
    geographyLevel,
    province: row.province,
    municipality: row.municipality,
    wikipediaTitle: wikipedia.title,
    wikipediaDescription: wikipedia.description,
    wikipediaExtract: wikipedia.extract,
    wikipediaUrl: wikipedia.url,
    storyAngles,
    tags: buildTags({
      province: row.province,
      municipality: row.municipality,
      weather,
      storyAngles,
    }),
    geocode,
    weather,
    knownWardCount: municipalitySummary?.knownWardCount ?? 0,
    evidenceBackedWardCount: municipalitySummary?.evidenceBackedWardCount ?? 0,
  };
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const [geographies, municipalitySummaries, wardCoverage] = await Promise.all([
    getGeographies(),
    getMunicipalitySummaries(),
    getWardRows(),
  ]);

  const profiles: ReferenceProfile[] = [];
  for (const row of geographies) {
    profiles.push(await buildProfile(row, municipalitySummaries));
  }

  const output: CollectionOutput = {
    generatedAt: new Date().toISOString(),
    profiles,
    wardCoverage: wardCoverage.map((row) => ({
      province: row.province,
      municipality: row.municipality,
      ward: row.ward,
      documentCount: row.documentCount,
      pressureCaseCount: row.pressureCaseCount,
      sentimentMentionCount: row.sentimentMentionCount,
      evidenceBacked:
        row.documentCount + row.pressureCaseCount + row.sentimentMentionCount > 0,
    })),
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(
    JSON.stringify(
      {
        outputPath: OUTPUT_PATH,
        profileCount: profiles.length,
        wardCoverageCount: output.wardCoverage.length,
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
