import { createRequire } from "module";
import type { MunicipalLeader } from "../src/lib/leadership/municipal-leaders";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { MUNICIPAL_LEADERS } = require("../src/lib/leadership/municipal-leaders") as {
  MUNICIPAL_LEADERS: MunicipalLeader[];
};

loadEnv();

function matchesLeader(corpus: string, aliases: string[]): boolean {
  const lowered = corpus.toLowerCase();
  return aliases.some((alias) => lowered.includes(alias.toLowerCase()));
}

async function main(): Promise<void> {
  const { query } = require("../src/lib/db");

  await query(`truncate municipal_leader_mentions, fact_municipal_leadership_sentiment_daily`);

  const documentsResult = await query(
    `
      select
        d.id,
        d.location_id,
        d.title,
        d.content_text,
        d.published_at,
        d.created_at,
        l.province,
        l.municipality
      from documents d
      left join locations l on l.id = d.location_id
      where d.status = 'active'
        and l.province is not null
        and l.municipality is not null
        and l.municipality <> 'Province Wide'
    `
  );

  let leaderMentionCount = 0;

  for (const document of documentsResult.rows) {
    const leader = MUNICIPAL_LEADERS.find(
      (entry: MunicipalLeader) =>
        entry.province === document.province &&
        entry.municipality === document.municipality &&
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
          insert into municipal_leader_mentions (
            document_id,
            location_id,
            province,
            municipality,
            leader_name,
            office,
            topic,
            sentiment_label,
            sentiment_score,
            confidence,
            evidence_text
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `,
        [
          document.id,
          document.location_id,
          document.province,
          document.municipality,
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
      insert into fact_municipal_leadership_sentiment_daily (
        day,
        province,
        municipality,
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
        mlm.province,
        mlm.municipality,
        mlm.leader_name,
        mlm.office,
        mlm.topic,
        round(avg(mlm.sentiment_score)::numeric, 2) as sentiment_score,
        round(avg(case when mlm.sentiment_label = 'negative' then 1.0 else 0.0 end)::numeric, 3) as negative_share,
        round(avg(case when mlm.sentiment_label = 'positive' then 1.0 else 0.0 end)::numeric, 3) as positive_share,
        count(*)::int as mention_count,
        round(avg(mlm.confidence)::numeric, 3) as avg_confidence
      from municipal_leader_mentions mlm
      join documents d on d.id = mlm.document_id
      group by 1, 2, 3, 4, 5, 6
      on conflict (day, province, municipality, leader_name, office, topic)
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
        count(distinct leader_name)::int as "leaderCount",
        count(distinct municipality)::int as "municipalityCount"
      from fact_municipal_leadership_sentiment_daily
    `
  );

  console.log(
    JSON.stringify(
      {
        documentsProcessed: documentsResult.rowCount ?? 0,
        leaderMentionCount,
        municipalLeadershipFactSummary: summary.rows[0] ?? {
          factRows: 0,
          leaderCount: 0,
          municipalityCount: 0,
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
