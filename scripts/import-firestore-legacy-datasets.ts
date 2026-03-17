import { createHash } from "crypto";
import { createRequire } from "module";

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

type CanonicalSector = "Civil" | "Roads" | "Health" | "Planning" | "Structural" | "Apex";
type CanonicalSentiment = "positive" | "neutral" | "negative";
type CanonicalSeverity = "Low" | "Medium" | "High";

interface RiskSignalDoc {
  id: string;
  country?: string;
  province?: string;
  municipality?: string;
  ward?: string;
  category?: string;
  type?: string;
  source?: string;
  sourceType?: string;
  sourceUrl?: string;
  text?: string;
  sentiment?: string;
  emotion?: string;
  urgency?: number;
  momentum?: number;
  reliabilityScore?: number;
  layers?: string[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

interface StrategicPayloadItem {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

interface StrategicDatasetDoc {
  id: string;
  country?: string;
  province?: string;
  municipality?: string;
  ward?: string;
  domain?: string;
  datasetId?: string;
  source?: string;
  confidence?: number;
  status?: string;
  payload?: StrategicPayloadItem[] | StrategicPayloadItem | null;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, length: number): string {
  return value.length <= length ? value : `${value.slice(0, Math.max(length - 1, 1)).trim()}…`;
}

function buildLocationKey(country: string, province: string | null, municipality: string | null, ward: string | null) {
  return [country, province ?? "", "", municipality ?? "", ward ?? ""].join("|");
}

function getSourceType(label?: string | null, url?: string | null): "news" | "gov" | "internal" | "social" | "ngo" {
  const normalized = (label ?? "").toLowerCase();
  const normalizedUrl = (url ?? "").toLowerCase();

  if (
    normalized.includes("facebook") ||
    normalized.includes("linkedin") ||
    normalized.includes("instagram") ||
    normalized.includes("x") ||
    normalized.includes("social") ||
    normalizedUrl.includes("facebook.com") ||
    normalizedUrl.includes("linkedin.com")
  ) {
    return "social";
  }

  if (normalized.includes("gic")) {
    return "internal";
  }

  if (normalized.includes("gov") || normalizedUrl.includes("gov.za")) {
    return "gov";
  }

  if (normalized.includes("ngo")) {
    return "ngo";
  }

  return "news";
}

function mapSector(label?: string | null, text?: string | null): CanonicalSector {
  const haystack = `${label ?? ""} ${text ?? ""}`.toLowerCase();

  if (haystack.includes("road") || haystack.includes("transport") || haystack.includes("bridge")) {
    return "Roads";
  }
  if (haystack.includes("health") || haystack.includes("clinic") || haystack.includes("hospital")) {
    return "Health";
  }
  if (haystack.includes("plan") || haystack.includes("budget") || haystack.includes("housing")) {
    return "Planning";
  }
  if (haystack.includes("water") || haystack.includes("sanitation") || haystack.includes("electricity")) {
    return "Structural";
  }
  if (haystack.includes("executive") || haystack.includes("premier") || haystack.includes("apex")) {
    return "Apex";
  }

  return "Civil";
}

function mapSentiment(value?: string | null): CanonicalSentiment {
  const normalized = (value ?? "").toLowerCase();
  if (normalized.includes("neg")) {
    return "negative";
  }
  if (normalized.includes("pos")) {
    return "positive";
  }
  return "neutral";
}

function parseDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function severityLabel(score: number): CanonicalSeverity {
  if (score >= 70) {
    return "High";
  }
  if (score >= 40) {
    return "Medium";
  }
  return "Low";
}

async function ensureSource(name: string, sourceType: "news" | "gov" | "internal" | "social" | "ngo", baseUrl: string) {
  const existing = await query<{ id: string }>(
    `
      select id
      from sources
      where name = $1
        and source_type = $2
      order by created_at asc
      limit 1
    `,
    [name, sourceType]
  );

  if (existing.rows[0]?.id) {
    return existing.rows[0].id;
  }

  const inserted = await query<{ id: string }>(
    `
      insert into sources (
        name,
        source_type,
        base_url,
        reliability_score,
        active,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, true, now(), now())
      returning id
    `,
    [name, sourceType, baseUrl, sourceType === "social" ? 0.62 : sourceType === "internal" ? 0.72 : 0.68]
  );

  return inserted.rows[0].id;
}

async function ensureLocation(country?: string | null, province?: string | null, municipality?: string | null, ward?: string | null) {
  if (!country && !province && !municipality && !ward) {
    return null;
  }

  const safeCountry = country ?? "South Africa";
  const result = await query<{ id: string }>(
    `
      insert into locations (country, province, district, municipality, ward, location_key)
      values ($1, $2, null, $3, $4, $5)
      on conflict (location_key)
      do update set
        province = excluded.province,
        municipality = excluded.municipality,
        ward = excluded.ward
      returning id
    `,
    [safeCountry, province ?? null, municipality ?? null, ward ?? null, buildLocationKey(safeCountry, province ?? null, municipality ?? null, ward ?? null)]
  );

  return result.rows[0]?.id ?? null;
}

async function documentExists(externalId: string, contentHash: string) {
  const existing = await query<{ id: string }>(
    `
      select id
      from documents
      where external_id = $1
         or content_hash = $2
      limit 1
    `,
    [externalId, contentHash]
  );

  return existing.rows[0]?.id ?? null;
}

async function insertDocument(input: {
  sourceId: string;
  locationId: string | null;
  externalId: string;
  url: string;
  title: string;
  publishedAt: string | null;
  docType: "article" | "report";
  contentText: string;
  contentHash: string;
  parserVersion: string;
}) {
  const inserted = await query<{ id: string }>(
    `
      insert into documents (
        source_id,
        location_id,
        external_id,
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
      values ($1, $2, $3, $4, $5, $6, now(), $7, 'en', $8, $9, $10, 'active')
      returning id
    `,
    [
      input.sourceId,
      input.locationId,
      input.externalId,
      input.url,
      input.title,
      input.publishedAt,
      input.docType,
      input.contentText,
      input.contentHash,
      input.parserVersion,
    ]
  );

  return inserted.rows[0].id;
}

async function queueForProcessing(documentId: string, sourceId: string) {
  await query(
    `
      insert into job_queue (job_type, payload)
      values ('process_document', $1::jsonb)
    `,
    [
      JSON.stringify({
        documentId,
        sourceId,
        parserVersion: "processor-v1",
        processingMode: "full",
      }),
    ]
  );
}

async function importRiskSignals(firestore: ReturnType<typeof getFirestore>) {
  const snapshot = await getDocs(collection(firestore, "riskSignals"));
  const rows: RiskSignalDoc[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<RiskSignalDoc, "id">),
  }));

  let insertedDocuments = 0;
  let insertedSignals = 0;
  let insertedIncidents = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = truncate(normalizeWhitespace(row.text ?? `${row.category ?? "Risk"} signal in ${row.province ?? "South Africa"}`), 280);
    const contentText = normalizeWhitespace(
      [
        row.text ?? title,
        row.category ? `Category: ${row.category}.` : "",
        row.type ? `Type: ${row.type}.` : "",
        row.sentiment ? `Sentiment: ${row.sentiment}.` : "",
        typeof row.urgency === "number" ? `Urgency: ${row.urgency}.` : "",
        row.municipality ? `Municipality: ${row.municipality}.` : "",
        row.province ? `Province: ${row.province}.` : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
    const contentHash = createHash("sha256")
      .update(`${title}\n${contentText}\n${row.sourceUrl ?? ""}`)
      .digest("hex");
    const externalId = `firebase-riskSignals:${row.id}`;

    if (await documentExists(externalId, contentHash)) {
      skipped += 1;
      continue;
    }

    const sourceName = normalizeWhitespace(row.source ?? "Legacy Firebase Risk Signals");
    const sourceType = getSourceType(row.sourceType ?? row.source, row.sourceUrl);
    const sourceId = await ensureSource(sourceName, sourceType, row.sourceUrl ?? "https://firebase.google.com");
    const locationId = await ensureLocation(row.country, row.province, row.municipality, row.ward);
    const publishedAt = parseDate(row.createdAt) ?? parseDate(row.updatedAt);

    const documentId = await insertDocument({
      sourceId,
      locationId,
      externalId,
      url: row.sourceUrl ?? "https://firebase.google.com",
      title,
      publishedAt,
      docType: "article",
      contentText,
      contentHash,
      parserVersion: "legacy-firebase-risk-signals-v1",
    });

    insertedDocuments += 1;

    const urgencyScore = Math.max(0, Math.min(100, (row.urgency ?? 3) * 20));
    const severityScore = Math.max(
      urgencyScore,
      Math.round(Math.max(0, Math.min(1, row.momentum ?? 0.35)) * 100)
    );
    const confidenceScore = Math.max(0.2, Math.min(1, row.reliabilityScore ?? 0.5));
    const sentiment = mapSentiment(row.sentiment ?? row.emotion);
    const sector = mapSector(row.category, row.text);

    const insertedSignal = await query<{ id: string }>(
      `
        insert into signals (
          document_id,
          location_id,
          sector,
          signal_type,
          sentiment,
          severity_score,
          urgency_score,
          confidence_score,
          event_date,
          summary_text,
          source_url,
          status
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
        returning id
      `,
      [
        documentId,
        locationId,
        sector,
        `firebase_risk_signal:${(row.type ?? "signal").toLowerCase()}`,
        sentiment,
        severityScore,
        urgencyScore,
        confidenceScore,
        publishedAt,
        truncate(contentText, 500),
        row.sourceUrl ?? null,
      ]
    );

    insertedSignals += 1;

    const text = `${row.text ?? ""} ${(row.layers ?? []).join(" ")}`.toLowerCase();
    const serviceDomain = row.category ? row.category.toLowerCase() : sector.toLowerCase();
    const responseIndicator = text.includes("response") || text.includes("plan") || text.includes("action");
    const protestIndicator = text.includes("protest") || text.includes("march");
    const failureIndicator =
      sentiment === "negative" || text.includes("crisis") || text.includes("failure") || text.includes("backlog");

    await query(
      `
        insert into service_incidents (
          signal_id,
          location_id,
          service_domain,
          incident_type,
          failure_indicator,
          citizen_pressure_indicator,
          protest_indicator,
          response_indicator,
          recurrence_indicator,
          severity,
          classification_confidence,
          opened_at,
          closed_at
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, false, $9, $10, $11, null)
      `,
      [
        insertedSignal.rows[0].id,
        locationId,
        serviceDomain,
        row.type ?? "risk_signal",
        failureIndicator,
        sentiment === "negative" || (row.layers ?? []).includes("issue"),
        protestIndicator,
        responseIndicator,
        severityLabel(severityScore),
        confidenceScore,
        publishedAt,
      ]
    );

    insertedIncidents += 1;
  }

  return {
    fetched: rows.length,
    insertedDocuments,
    insertedSignals,
    insertedIncidents,
    skipped,
  };
}

function normalizeStrategicPayload(payload: StrategicDatasetDoc["payload"]): StrategicPayloadItem[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [payload];
}

async function importStrategicDatasets(firestore: ReturnType<typeof getFirestore>) {
  const snapshot = await getDocs(collection(firestore, "strategicDatasets"));
  const rows: StrategicDatasetDoc[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<StrategicDatasetDoc, "id">),
  }));

  let insertedDocuments = 0;
  let queued = 0;
  let skipped = 0;

  for (const row of rows) {
    const payloadItems = normalizeStrategicPayload(row.payload);
    const locationId = await ensureLocation(row.country, row.province, row.municipality, row.ward);
    const sourceName = normalizeWhitespace(row.source ?? "Legacy Firebase Strategic Datasets");
    const sourceId = await ensureSource(sourceName, getSourceType(row.source, null), "https://firebase.google.com");

    for (let index = 0; index < payloadItems.length; index += 1) {
      const item = payloadItems[index];
      const titleBase = normalizeWhitespace(item.title ?? `${row.domain ?? "Strategic dataset"} narrative`);
      const contentText = normalizeWhitespace(
        [
          item.content ?? titleBase,
          row.domain ? `Domain: ${row.domain}.` : "",
          row.province ? `Province: ${row.province}.` : "",
          row.municipality ? `Municipality: ${row.municipality}.` : "",
          row.datasetId ? `Dataset: ${row.datasetId}.` : "",
          typeof item.score === "number" ? `Legacy score: ${item.score}.` : "",
          typeof row.confidence === "number" ? `Dataset confidence: ${row.confidence}.` : "",
        ]
          .filter(Boolean)
          .join(" ")
      );
      const contentHash = createHash("sha256")
        .update(`${titleBase}\n${contentText}\n${item.url ?? ""}`)
        .digest("hex");
      const externalId = `firebase-strategicDatasets:${row.id}:${index}`;

      if (await documentExists(externalId, contentHash)) {
        skipped += 1;
        continue;
      }

      const documentId = await insertDocument({
        sourceId,
        locationId,
        externalId,
        url: item.url ?? "https://firebase.google.com",
        title: truncate(titleBase, 280),
        publishedAt: null,
        docType: item.url?.toLowerCase().includes(".pdf") ? "report" : "article",
        contentText,
        contentHash,
        parserVersion: "legacy-firebase-strategic-datasets-v1",
      });

      insertedDocuments += 1;
      await queueForProcessing(documentId, sourceId);
      queued += 1;
    }
  }

  return {
    fetched: rows.length,
    insertedDocuments,
    queued,
    skipped,
  };
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  const riskSignals = await importRiskSignals(firestore);
  const strategicDatasets = await importStrategicDatasets(firestore);

  console.log(
    JSON.stringify(
      {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        riskSignals,
        strategicDatasets,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
