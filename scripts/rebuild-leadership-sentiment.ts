import { createRequire } from "module";
import type { ProvincialLeader } from "../src/lib/leadership/provincial-leaders";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { PROVINCIAL_LEADERS } = require("../src/lib/leadership/provincial-leaders") as {
  PROVINCIAL_LEADERS: ProvincialLeader[];
};

loadEnv();

function matchesLeader(corpus: string, aliases: string[]): boolean {
  const lowered = corpus.toLowerCase();
  return aliases.some((alias) => lowered.includes(alias.toLowerCase()));
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  await query(`truncate leader_mentions, fact_leadership_sentiment_daily`);

  const documentsResult = await query(
    `
      select
        d.id,
        d.location_id,
        d.title,
        d.content_text,
        d.published_at,
        d.created_at,
        l.province
      from documents d
      left join locations l on l.id = d.location_id
      where d.status = 'active'
        and l.province is not null
    `
  );

  let leaderMentionCount = 0;

  for (const document of documentsResult.rows) {
    const leader = PROVINCIAL_LEADERS.find(
      (entry: ProvincialLeader) =>
        entry.province === document.province &&
        matchesLeader(`${document.title}\n${document.content_text}`, entry.aliases)
    );

    if (!leader) {
      continue;
    }

    const sentimentRows = await query(
      `
        select
          topic,
          sentiment_label,
          sentiment_score,
          confidence,
          evidence_text
        from sentiment_mentions
        where document_id = $1
      `,
      [document.id]
    );

    if (sentimentRows.rowCount === 0) {
      continue;
    }

    for (const sentiment of sentimentRows.rows) {
      await query(
        `
          insert into leader_mentions (
            document_id,
            location_id,
            province,
            leader_name,
            office,
            topic,
            sentiment_label,
            sentiment_score,
            confidence,
            evidence_text
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
        [
          document.id,
          document.location_id,
          document.province,
          leader.leaderName,
          leader.office,
          sentiment.topic,
          sentiment.sentiment_label,
          sentiment.sentiment_score,
          sentiment.confidence,
          sentiment.evidence_text,
        ]
      );
      leaderMentionCount += 1;
    }
  }

  await query(
    `
      insert into fact_leadership_sentiment_daily (
        day,
        province,
        leader_name,
        office,
        topic,
        sentiment_score,
        negative_share,
        positive_share,
        mention_count,
        avg_confidence
      )
      select
        coalesce(date(d.published_at), date(d.created_at)) as day,
        lm.province,
        lm.leader_name,
        lm.office,
        lm.topic,
        round(avg(lm.sentiment_score)::numeric, 2) as sentiment_score,
        round(avg(case when lm.sentiment_label = 'negative' then 1.0 else 0.0 end)::numeric, 3) as negative_share,
        round(avg(case when lm.sentiment_label = 'positive' then 1.0 else 0.0 end)::numeric, 3) as positive_share,
        count(*)::int as mention_count,
        round(avg(lm.confidence)::numeric, 3) as avg_confidence
      from leader_mentions lm
      join documents d on d.id = lm.document_id
      group by 1, 2, 3, 4, 5
      on conflict (day, province, leader_name, office, topic)
      do update set
        sentiment_score = excluded.sentiment_score,
        negative_share = excluded.negative_share,
        positive_share = excluded.positive_share,
        mention_count = excluded.mention_count,
        avg_confidence = excluded.avg_confidence
    `
  );

  const summary = await query(
    `
      select
        count(*)::int as "factRows",
        count(distinct leader_name)::int as "leaderCount"
      from fact_leadership_sentiment_daily
    `
  );

  console.log(
    JSON.stringify(
      {
        documentsProcessed: documentsResult.rowCount ?? 0,
        leaderMentionCount,
        leadershipFactSummary: summary.rows[0] ?? {
          factRows: 0,
          leaderCount: 0,
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
