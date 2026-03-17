import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");
const { readCsvRows, optionalBoolean, optionalNumber } = require("./election-import-utils") as typeof import("./election-import-utils");
const {
  municipalityCode,
  parseWardNumber,
  provinceCode,
  wardKey,
} = require("./place-reference-utils") as typeof import("./place-reference-utils");

loadEnv();

const { query } = require("../src/lib/db") as typeof import("../src/lib/db");

async function main() {
  const rows = await readCsvRows("data/reference/elections/ward_election_results.csv");
  let upserted = 0;

  for (const row of rows) {
    const provinceName = row.province_name?.trim();
    const municipalityName = row.municipality_name?.trim();
    const wardName = row.ward_name?.trim();
    const electionYear = optionalNumber(row.election_year);
    const electionType = row.election_type?.trim();
    const partyName = row.party_name?.trim();

    if (!provinceName || !municipalityName || !wardName || !electionYear || !electionType || !partyName) {
      continue;
    }

    await query(
      `
        insert into ward_election_results (
          ward_key,
          ward_number,
          ward_name,
          municipality_code,
          municipality_name,
          province_code,
          province_name,
          election_year,
          election_type,
          party_name,
          candidate_name,
          votes,
          vote_share,
          turnout,
          winner_flag,
          source_name,
          source_url,
          retrieved_at
        )
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now())
        on conflict (province_name, municipality_name, ward_name, election_year, election_type, party_name, candidate_name)
        do update set
          votes = excluded.votes,
          vote_share = excluded.vote_share,
          turnout = excluded.turnout,
          winner_flag = excluded.winner_flag,
          source_name = excluded.source_name,
          source_url = excluded.source_url
      `,
      [
        wardKey(provinceName, municipalityName, wardName),
        parseWardNumber(wardName),
        wardName,
        municipalityCode(provinceName, municipalityName),
        municipalityName,
        provinceCode(provinceName),
        provinceName,
        electionYear,
        electionType,
        partyName,
        row.candidate_name?.trim() || null,
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

  console.log(JSON.stringify({ file: "ward_election_results.csv", rowCount: rows.length, upserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
