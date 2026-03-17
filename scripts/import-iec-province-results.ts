import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, optionalBoolean, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");
const { provinceCode } = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const rows = await readCsvRows("data/reference/elections/province_election_results.csv");
  let upserted = 0;

  for (const row of rows) {
    const provinceName = row.province_name?.trim();
    const electionYear = optionalNumber(row.election_year);
    const electionType = row.election_type?.trim();
    const partyName = row.party_name?.trim();

    if (!provinceName || !electionYear || !electionType || !partyName) {
      continue;
    }

    await query(
      `
        insert into province_election_results (
          province_code,
          province_name,
          election_year,
          election_type,
          party_name,
          votes,
          vote_share,
          turnout,
          winner_flag,
          source_name,
          source_url,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,now())
        on conflict (province_name, election_year, election_type, party_name)
        do update set
          votes = excluded.votes,
          vote_share = excluded.vote_share,
          turnout = excluded.turnout,
          winner_flag = excluded.winner_flag,
          source_name = excluded.source_name,
          source_url = excluded.source_url
      `,
      [
        provinceCode(provinceName),
        provinceName,
        electionYear,
        electionType,
        partyName,
        optionalNumber(row.votes),
        optionalNumber(row.vote_share),
        optionalNumber(row.turnout),
        optionalBoolean(row.winner_flag),
        row.source_name?.trim() || "IEC import",
        row.source_url?.trim() || null,
      ]
    );
    upserted += 1;
  }

  console.log(JSON.stringify({ file: "province_election_results.csv", rowCount: rows.length, upserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
