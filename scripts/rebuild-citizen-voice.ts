import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const ISSUE_RULES: Record<string, RegExp[]> = {
  water: [/water/i, /no water/i, /burst pipe/i, /sewage/i, /sewer/i, /sanitation/i, /tankers?/i],
  roads: [/pothole/i, /road/i, /bridge/i, /traffic lights?/i, /damaged road/i],
  electricity: [/power outage/i, /electricity/i, /substation/i, /transformer/i, /load shedding/i],
  refuse: [/refuse/i, /waste/i, /garbage/i, /rubbish/i, /dumping/i, /not collected/i],
  housing: [/housing/i, /rdp/i, /informal settlement/i, /evictions?/i, /backyard dwellers?/i, /shelter/i],
  healthcare: [/clinic/i, /hospital/i, /medicine shortage/i, /ambulance/i, /healthcare/i, /patients?/i],
  governance: [/municipalit/i, /billing/i, /corruption/i, /service delivery/i, /failed us/i, /ratepayers?/i],
};

const CITIZEN_PATTERNS = [
  /residents?/i,
  /community/i,
  /communities/i,
  /locals?/i,
  /ratepayers?/i,
  /households?/i,
  /commuters?/i,
  /parents?/i,
  /patients?/i,
  /people say/i,
  /residents say/i,
  /residents have/i,
  /community members?/i,
  /frustrated residents?/i,
  /angry residents?/i,
  /ordinary citizens?/i,
  /complaints?/i,
  /fed up/i,
  /we need/i,
  /we are tired/i,
  /locals say/i,
  /residents demand/i,
  /families/i,
  /neighbours?/i,
  /queueing/i,
];

const POSITIVE_PATTERNS = [
  /restored/i,
  /fixed/i,
  /repaired/i,
  /reopened/i,
  /resolved/i,
  /improved/i,
  /responded/i,
];

const NEGATIVE_PATTERNS = [
  /outage/i,
  /failure/i,
  /collapsed?/i,
  /overflow/i,
  /delay/i,
  /backlog/i,
  /angry/i,
  /frustrat/i,
  /protest/i,
  /crisis/i,
  /broken/i,
  /shutdown/i,
  /interruption/i,
];

const LEGACY_CATEGORY_HINTS: Record<string, string[]> = {
  water: ["water", "sewage", "sanitation", "sewer"],
  roads: ["road", "roads", "pothole", "bridge", "traffic"],
  electricity: ["electricity", "power", "substation", "transformer", "load shedding"],
  refuse: ["refuse", "waste", "garbage", "rubbish", "dumping"],
  housing: ["housing", "rdp", "informal settlement", "eviction", "shelter"],
  healthcare: ["clinic", "hospital", "ambulance", "health"],
  governance: ["billing", "corruption", "service delivery", "municipal", "municipality", "governance"],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function matchCount(text: string, patterns: RegExp[]): number {
  return patterns.reduce((count, pattern) => (pattern.test(text) ? count + 1 : count), 0);
}

function extractEvidence(text: string, patterns: RegExp[]): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  const matchIndex = patterns
    .map((pattern) => normalized.search(pattern))
    .find((index) => index >= 0);

  if (matchIndex === undefined || matchIndex < 0) {
    return normalized.slice(0, 320);
  }

  const start = Math.max(0, matchIndex - 80);
  const end = Math.min(normalized.length, matchIndex + 220);
  return normalized.slice(start, end).trim();
}

function scoreSentiment(text: string): {
  sentimentLabel: "positive" | "neutral" | "negative";
  sentimentScore: number;
  confidence: number;
} {
  const positiveCount = matchCount(text, POSITIVE_PATTERNS);
  const negativeCount = matchCount(text, NEGATIVE_PATTERNS);
  const citizenCount = matchCount(text, CITIZEN_PATTERNS);
  const sentimentScore = clamp(50 + positiveCount * 10 - negativeCount * 14, 0, 100);
  const confidence = clamp(0.45 + (positiveCount + negativeCount) * 0.06 + citizenCount * 0.04, 0.45, 0.92);
  const sentimentLabel =
    sentimentScore >= 60 ? "positive" : sentimentScore <= 40 ? "negative" : "neutral";

  return {
    sentimentLabel,
    sentimentScore,
    confidence,
  };
}

async function main(): Promise<void> {
  const { query: rawQuery } = require("../src/lib/db");
  const query = rawQuery as <TRow>(
    text: string,
    params?: unknown[]
  ) => Promise<{ rows: TRow[]; rowCount: number | null }>;

  await query(`truncate citizen_voice_mentions, fact_citizen_voice_daily`);

  const packsResult = await query<{
    id: string;
    scope_type: string;
    scope_name: string;
    issue_family: string;
  }>(`
    select id, scope_type, scope_name, issue_family
    from citizen_voice_query_packs
    where active = true
      and verification_status = 'verified'
  `);

  const byProvince = new Map<string, Array<{ id: string; issueFamily: string }>>();
  const byMunicipality = new Map<string, Array<{ id: string; issueFamily: string }>>();
  for (const row of packsResult.rows) {
    const targetMap = row.scope_type === "municipality" ? byMunicipality : byProvince;
    const existing = targetMap.get(row.scope_name) ?? [];
    existing.push({ id: row.id, issueFamily: row.issue_family });
    targetMap.set(row.scope_name, existing);
  }

  const documentsResult = await query<{
    id: string;
    title: string;
    content_text: string;
    published_at: string | null;
    created_at: string;
    source_type: string;
    parser_version: string;
    province: string | null;
    municipality: string | null;
  }>(`
    select
      d.id,
      d.title,
      d.content_text,
      d.published_at,
      d.created_at,
      s.source_type,
      d.parser_version,
      l.province,
      l.municipality
    from documents d
    join sources s on s.id = d.source_id
    left join locations l on l.id = d.location_id
    where d.status = 'active'
      and l.province is not null
      and s.source_type in ('news', 'social', 'ngo', 'research', 'watchdog')
  `);

  let mentionCount = 0;

  for (const document of documentsResult.rows) {
    if (!document.province) {
      continue;
    }

    const provincePacks = byProvince.get(document.province) ?? [];
    const municipalityPacks = document.municipality ? byMunicipality.get(document.municipality) ?? [] : [];
    const activePacks = [...provincePacks, ...municipalityPacks];

    if (activePacks.length === 0) {
      continue;
    }

    const corpus = `${document.title}\n${document.content_text}`;
    const isLegacyCommunitySignal = document.parser_version === "legacy-community-signals-v1";
    const hasCitizenLanguage =
      isLegacyCommunitySignal || CITIZEN_PATTERNS.some((pattern) => pattern.test(corpus));

    if (!hasCitizenLanguage) {
      continue;
    }

    for (const pack of activePacks) {
      const issuePatterns = ISSUE_RULES[pack.issueFamily] ?? [];
      const legacyHints = LEGACY_CATEGORY_HINTS[pack.issueFamily] ?? [];
      const matchesLegacyHint = isLegacyCommunitySignal
        ? legacyHints.some((hint) => corpus.toLowerCase().includes(hint))
        : false;
      const matchesIssue = issuePatterns.some((pattern) => pattern.test(corpus)) || matchesLegacyHint;

      if (!matchesIssue) {
        continue;
      }

      const scored = scoreSentiment(corpus);
      const evidenceText = extractEvidence(corpus, [...CITIZEN_PATTERNS, ...issuePatterns]);

      await query(
        `
          insert into citizen_voice_mentions (
            query_pack_id,
            document_id,
            province,
            municipality,
            issue_family,
            source_type,
            sentiment_label,
            sentiment_score,
            confidence,
            evidence_text
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          on conflict (query_pack_id, document_id)
          do nothing
        `,
        [
          pack.id,
          document.id,
          document.province,
          document.municipality,
          pack.issueFamily,
          document.source_type,
          scored.sentimentLabel,
          scored.sentimentScore,
          scored.confidence,
          evidenceText,
        ]
      );

      mentionCount += 1;
    }
  }

  await query(`
    insert into fact_citizen_voice_daily (
      day,
      province,
      municipality,
      issue_family,
      mention_count,
      document_count,
      negative_share,
      avg_sentiment_score,
      avg_confidence
    )
    select
      coalesce(date(d.published_at), date(d.created_at)) as day,
      cvm.province,
      coalesce(cvm.municipality, 'Province Wide') as municipality,
      cvm.issue_family,
      count(*)::int as mention_count,
      count(distinct cvm.document_id)::int as document_count,
      round(avg(case when cvm.sentiment_label = 'negative' then 1.0 else 0.0 end)::numeric, 3) as negative_share,
      round(avg(cvm.sentiment_score)::numeric, 2) as avg_sentiment_score,
      round(avg(cvm.confidence)::numeric, 3) as avg_confidence
    from citizen_voice_mentions cvm
    join documents d on d.id = cvm.document_id
    group by 1, 2, 3, 4
    on conflict (day, province, municipality, issue_family)
    do update set
      mention_count = excluded.mention_count,
      document_count = excluded.document_count,
      negative_share = excluded.negative_share,
      avg_sentiment_score = excluded.avg_sentiment_score,
      avg_confidence = excluded.avg_confidence
  `);

  const summary = await query<{
    mentionRows: number;
    provinceCount: number;
  }>(`
    select
      count(*)::int as "mentionRows",
      count(distinct province)::int as "provinceCount"
    from fact_citizen_voice_daily
  `);

  console.log(
    JSON.stringify(
      {
        documentsProcessed: documentsResult.rowCount ?? 0,
        mentionCount,
        factSummary: summary.rows[0] ?? {
          mentionRows: 0,
          provinceCount: 0,
        },
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
