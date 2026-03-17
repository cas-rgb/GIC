import { createHash } from "crypto";
import { createRequire } from "module";

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { getLegacyCommunityAlias } = require("../src/lib/legacy/community-aliases") as typeof import("../src/lib/legacy/community-aliases");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

interface FirestoreTimestampLike {
  seconds?: number;
  nanoseconds?: number;
}

interface CommunitySignalDoc {
  id: string;
  community?: string;
  category?: string;
  sentiment?: string;
  source?: string;
  timestamp?: string;
  createdAt?: FirestoreTimestampLike;
  urgency?: number;
  issue?: string;
  evidence?: string;
  platform?: string;
  premier?: string;
  detected_location?: string;
  detected_topic?: string;
  excerpt?: string;
  url?: string;
  source_type?: string;
  source_name?: string;
  verified_citizen?: boolean;
  ward?: string;
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
];

const MUNICIPALITIES_BY_PROVINCE: Record<string, string[]> = {
  Gauteng: ["City of Johannesburg", "City of Tshwane", "Ekurhuleni", "Emfuleni"],
  "Western Cape": ["City of Cape Town", "George", "Saldanha Bay", "Stellenbosch", "Drakenstein"],
  "KwaZulu-Natal": ["eThekwini", "Msunduzi", "uMhlathuze", "Ray Nkonyeni", "Newcastle"],
  "Eastern Cape": ["Nelson Mandela Bay", "Buffalo City", "OR Tambo", "Chris Hani", "Joe Gqabi"],
  Limpopo: ["Polokwane", "Mogalakwena", "Thulamela", "Tzaneen", "Ba-Phalaborwa"],
  Mpumalanga: ["Mbombela", "Emalahleni", "Steve Tshwete", "Govan Mbeki", "Lekwa", "Thembisile Hani"],
  "North West": ["Rustenburg", "Madibeng", "Matlosana", "JB Marks", "Mahikeng", "Nkangala District"],
  "Free State": ["Mangaung", "Matjhabeng", "Metsimaholo", "Maluti-a-Phofung", "Dihlabeng"],
  "Northern Cape": ["Sol Plaatje", "Ga-Segonyana", "Dawid Kruiper", "Siyancuma", "Nama Khoi"],
};

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function sourceTypeFromLegacy(signal: CommunitySignalDoc): string {
  const platform = (signal.platform ?? signal.source_type ?? signal.source_name ?? "").toLowerCase();
  const url = (signal.source ?? signal.url ?? "").toLowerCase();

  if (
    platform.includes("facebook") ||
    platform.includes("instagram") ||
    platform.includes("tiktok") ||
    platform.includes("linkedin") ||
    platform.includes("social") ||
    platform.includes("x")
  ) {
    return "social";
  }

  if (platform.includes("ngo")) {
    return "ngo";
  }

  if (platform.includes("radio")) {
    return "news";
  }

  if (url.includes("gov.za")) {
    return "gov";
  }

  return "news";
}

function parsePublishedAt(signal: CommunitySignalDoc): string | null {
  if (signal.timestamp) {
    const date = new Date(signal.timestamp);
    if (!Number.isNaN(date.valueOf())) {
      return date.toISOString();
    }
  }

  if (signal.createdAt?.seconds) {
    return new Date(signal.createdAt.seconds * 1000).toISOString();
  }

  return null;
}

function resolveLocation(signal: CommunitySignalDoc) {
  const raw =
    signal.detected_location ??
    signal.community ??
    "";
  const normalized = raw.trim();
  const lower = normalized.toLowerCase();

  if (!normalized) {
    return {
      country: "South Africa",
      province: null as string | null,
      municipality: null as string | null,
      ward: signal.ward ?? null,
    };
  }

  const alias = getLegacyCommunityAlias(lower);
  if (alias) {
    return {
      country: "South Africa",
      province: alias.province,
      municipality: alias.municipality ?? null,
      ward: signal.ward ?? alias.ward ?? null,
    };
  }

  const exactProvince = PROVINCES.find((province) => province.toLowerCase() === lower);
  if (exactProvince) {
    return {
      country: "South Africa",
      province: exactProvince,
      municipality: null,
      ward: signal.ward ?? null,
    };
  }

  for (const province of PROVINCES) {
    const municipalities = MUNICIPALITIES_BY_PROVINCE[province] ?? [];
    const municipality = municipalities.find((candidate) => {
      const candidateLower = candidate.toLowerCase();
      return candidateLower === lower || candidateLower.includes(lower) || lower.includes(candidateLower);
    });

    if (municipality) {
      return {
        country: "South Africa",
        province,
        municipality,
        ward: signal.ward ?? null,
      };
    }
  }

  return {
    country: "South Africa",
    province: titleCase(normalized),
    municipality: null,
    ward: signal.ward ?? null,
  };
}

function buildLocationKey(country: string, province: string | null, municipality: string | null, ward: string | null) {
  return [country, province ?? "", "", municipality ?? "", ward ?? ""].join("|");
}

async function ensureSource(signal: CommunitySignalDoc): Promise<string> {
  const name =
    normalizeWhitespace(
      signal.source_name ??
        signal.platform ??
        signal.source_type ??
        "Legacy Firebase Community Signals"
    ) || "Legacy Firebase Community Signals";
  const sourceType = sourceTypeFromLegacy(signal);
  const baseUrl = signal.source ?? signal.url ?? "https://firebase.google.com";

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
    [name, sourceType, baseUrl, sourceType === "social" ? 0.62 : 0.7]
  );

  return inserted.rows[0].id;
}

async function ensureLocation(signal: CommunitySignalDoc): Promise<string | null> {
  const location = resolveLocation(signal);

  if (!location.province && !location.municipality && !location.ward) {
    return null;
  }

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
    [
      location.country,
      location.province,
      location.municipality,
      location.ward,
      buildLocationKey(location.country, location.province, location.municipality, location.ward),
    ]
  );

  return result.rows[0]?.id ?? null;
}

function buildDocument(signal: CommunitySignalDoc) {
  const issue = normalizeWhitespace(signal.issue ?? signal.detected_topic ?? "Community signal");
  const evidence = normalizeWhitespace(signal.evidence ?? signal.excerpt ?? issue);
  const community = normalizeWhitespace(signal.community ?? signal.detected_location ?? "South Africa");
  const title = `${issue} | ${community}`.slice(0, 300);
  const contentText = normalizeWhitespace(
    [
      `Legacy community signal from ${community}.`,
      signal.category ? `Category: ${signal.category}.` : "",
      signal.sentiment ? `Sentiment: ${signal.sentiment}.` : "",
      typeof signal.urgency === "number" ? `Urgency: ${signal.urgency}.` : "",
      signal.platform ? `Platform: ${signal.platform}.` : "",
      signal.premier ? `Referenced leader: ${signal.premier}.` : "",
      `Issue: ${issue}.`,
      `Evidence: ${evidence}.`,
    ]
      .filter(Boolean)
      .join(" ")
  );
  const contentHash = createHash("sha256")
    .update(`${title}\n${contentText}\n${signal.source ?? signal.url ?? ""}`)
    .digest("hex");

  return {
    title,
    contentText,
    contentHash,
    issue,
  };
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  const snapshot = await getDocs(collection(firestore, "community_signals"));
  const rows: CommunitySignalDoc[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CommunitySignalDoc, "id">),
  }));

  let inserted = 0;
  let skipped = 0;
  let enqueued = 0;

  for (const signal of rows) {
    const document = buildDocument(signal);
    const sourceId = await ensureSource(signal);
    const locationId = await ensureLocation(signal);
    const externalId = `firebase-community-signals:${signal.id}`;

    const exists = await query<{ id: string }>(
      `
        select id
        from documents
        where external_id = $1
           or content_hash = $2
        limit 1
      `,
      [externalId, document.contentHash]
    );

    if (exists.rows.length > 0) {
      skipped += 1;
      continue;
    }

    const publishedAt = parsePublishedAt(signal);
    const insertedDocument = await query<{ id: string }>(
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
        values ($1, $2, $3, $4, $5, $6, now(), 'article', 'en', $7, $8, 'legacy-community-signals-v1', 'active')
        returning id
      `,
      [
        sourceId,
        locationId,
        externalId,
        signal.source ?? signal.url ?? "https://firebase.google.com",
        document.title,
        publishedAt,
        document.contentText,
        document.contentHash,
      ]
    );

    await query(
      `
        insert into job_queue (job_type, payload)
        values ('process_document', $1::jsonb)
      `,
      [
        JSON.stringify({
          documentId: insertedDocument.rows[0].id,
          sourceId,
          parserVersion: "processor-v1",
          processingMode: "full",
        }),
      ]
    );

    inserted += 1;
    enqueued += 1;
  }

  console.log(
    JSON.stringify(
      {
        fetched: rows.length,
        inserted,
        skipped,
        enqueued,
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
