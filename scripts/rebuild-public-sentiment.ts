import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const TOPIC_RULES = [
  {
    topic: "Water and Sanitation",
    patterns: [/water/i, /sewer/i, /sanitation/i, /wastewater/i, /stormwater/i, /flood/i],
  },
  {
    topic: "Roads and Transport",
    patterns: [/road/i, /bridge/i, /traffic/i, /transport/i, /pothole/i, /rail/i],
  },
  {
    topic: "Electricity and Energy",
    patterns: [/electricity/i, /power/i, /load shedding/i, /substation/i, /energy/i, /lighting/i],
  },
  {
    topic: "Housing and Settlements",
    patterns: [/housing/i, /settlement/i, /human settlements/i, /land invasion/i],
  },
  {
    topic: "Healthcare",
    patterns: [/clinic/i, /hospital/i, /health/i, /medical/i],
  },
  {
    topic: "Municipal Governance",
    patterns: [/municipal/i, /governance/i, /council/i, /mayor/i, /premier/i, /mismanagement/i, /debt/i],
  },
  {
    topic: "Community Infrastructure",
    patterns: [/library/i, /park/i, /facility/i, /sports?/i, /community hall/i, /cemetery/i, /building/i],
  },
];

const POSITIVE_PATTERNS = [
  /upgrade/i,
  /investment/i,
  /funding/i,
  /restored/i,
  /improv(?:e|ed|ement)/i,
  /completed/i,
  /launch/i,
  /gain momentum/i,
  /revived/i,
  /back on track/i,
  /allocated/i,
  /reduction/i,
  /success/i,
];

const NEGATIVE_PATTERNS = [
  /crisis/i,
  /outage/i,
  /failure/i,
  /collapse/i,
  /shortage/i,
  /leak/i,
  /overflow/i,
  /protest/i,
  /anger/i,
  /frustration/i,
  /delay/i,
  /backlog/i,
  /flood/i,
  /debt/i,
  /mismanagement/i,
  /decay/i,
  /sabotage/i,
  /warning/i,
  /halted/i,
  /under scrutiny/i,
  /urgent/i,
];

function matchCount(text: string, patterns: RegExp[]): number {
  return patterns.reduce(
    (count, pattern) => (pattern.test(text) ? count + 1 : count),
    0
  );
}

function classifyTopics(text: string): string[] {
  const topics = TOPIC_RULES.filter((rule) =>
    rule.patterns.some((pattern) => pattern.test(text))
  ).map((rule) => rule.topic);

  return topics.length > 0 ? topics : ["Municipal Governance"];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreSentiment(text: string, topicCount: number) {
  const positiveCount = matchCount(text, POSITIVE_PATTERNS);
  const negativeCount = matchCount(text, NEGATIVE_PATTERNS);
  const sentimentScore = clamp(
    50 + positiveCount * 12 - negativeCount * 15,
    0,
    100
  );
  const sentimentLabel =
    sentimentScore >= 60 ? "positive" : sentimentScore <= 40 ? "negative" : "neutral";
  const confidence = clamp(
    0.45 + (positiveCount + negativeCount) * 0.08 + topicCount * 0.05,
    0.45,
    0.95
  );

  return {
    sentimentScore,
    sentimentLabel,
    confidence,
  };
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  await query(`truncate sentiment_mentions, fact_sentiment_daily, fact_topic_share_daily`);

  const documentsResult = await query(
    `
      select
        d.id,
        d.location_id,
        d.title,
        d.content_text,
        d.published_at,
        d.created_at,
        src.source_type,
        l.province,
        l.municipality
      from documents d
      join sources src on src.id = d.source_id
      left join locations l on l.id = d.location_id
      where d.status = 'active'
        and l.province is not null
        and src.source_type in ('news', 'gov', 'ngo', 'research', 'watchdog', 'social')
    `
  );

  let mentionCount = 0;

  for (const document of documentsResult.rows) {
    const corpus = `${document.title}\n${document.content_text}`;
    const topics = classifyTopics(corpus);
    const scored = scoreSentiment(corpus, topics.length);
    const evidenceText = corpus.replace(/\s+/g, " ").trim().slice(0, 320);

    for (const topic of topics) {
      await query(
        `
          insert into sentiment_mentions (
            document_id,
            location_id,
            source_type,
            topic,
            sentiment_label,
            sentiment_score,
            confidence,
            evidence_text
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          document.id,
          document.location_id,
          document.source_type,
          topic,
          scored.sentimentLabel,
          scored.sentimentScore,
          scored.confidence,
          evidenceText,
        ]
      );
      mentionCount += 1;
    }
  }

  await query(
    `
      insert into fact_sentiment_daily (
        day,
        province,
        municipality,
        topic,
        sentiment_score,
        negative_share,
        positive_share,
        mention_count,
        avg_confidence
      )
      select
        coalesce(date(d.published_at), date(d.created_at)) as day,
        l.province,
        coalesce(l.municipality, 'Province Wide') as municipality,
        sm.topic,
        round(avg(sm.sentiment_score)::numeric, 2) as sentiment_score,
        round(avg(case when sm.sentiment_label = 'negative' then 1.0 else 0.0 end)::numeric, 3) as negative_share,
        round(avg(case when sm.sentiment_label = 'positive' then 1.0 else 0.0 end)::numeric, 3) as positive_share,
        count(*)::int as mention_count,
        round(avg(sm.confidence)::numeric, 3) as avg_confidence
      from sentiment_mentions sm
      join documents d on d.id = sm.document_id
      left join locations l on l.id = sm.location_id
      where l.province is not null
      group by 1, 2, 3, 4
      on conflict (day, province, municipality, topic)
      do update set
        sentiment_score = excluded.sentiment_score,
        negative_share = excluded.negative_share,
        positive_share = excluded.positive_share,
        mention_count = excluded.mention_count,
        avg_confidence = excluded.avg_confidence
    `
  );

  await query(
    `
      insert into fact_topic_share_daily (
        day,
        province,
        topic,
        mention_count,
        share_of_voice,
        avg_confidence
      )
      with topic_totals as (
        select
          coalesce(date(d.published_at), date(d.created_at)) as day,
          l.province,
          sm.topic,
          count(*)::int as mention_count,
          round(avg(sm.confidence)::numeric, 3) as avg_confidence
        from sentiment_mentions sm
        join documents d on d.id = sm.document_id
        left join locations l on l.id = sm.location_id
        where l.province is not null
        group by 1, 2, 3
      ),
      province_totals as (
        select
          day,
          province,
          sum(mention_count)::int as total_mentions
        from topic_totals
        group by 1, 2
      )
      select
        tt.day,
        tt.province,
        tt.topic,
        tt.mention_count,
        round((tt.mention_count::numeric / greatest(pt.total_mentions, 1)), 3) as share_of_voice,
        tt.avg_confidence
      from topic_totals tt
      join province_totals pt
        on pt.day = tt.day
       and pt.province = tt.province
      on conflict (day, province, topic)
      do update set
        mention_count = excluded.mention_count,
        share_of_voice = excluded.share_of_voice,
        avg_confidence = excluded.avg_confidence
    `
  );

  const summary = await query(
    `
      select
        count(*)::int as "mentionRows",
        count(distinct province)::int as "provinceCount"
      from fact_sentiment_daily
    `
  );

  console.log(
    JSON.stringify(
      {
        documentsProcessed: documentsResult.rowCount ?? 0,
        mentionCount,
        sentimentFactSummary: summary.rows[0] ?? {
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
