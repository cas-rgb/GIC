import { query } from "@/lib/db";
import { ElectionHistoryResponse } from "@/lib/analytics/types";

interface ElectionRow {
  election_year: number;
  election_type: string;
  party_name: string;
  candidate_name: string | null;
  votes: number | null;
  vote_share: number | null;
  turnout: number | null;
  winner_flag: boolean;
}

export async function getPlaceElectionHistory(input: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}): Promise<ElectionHistoryResponse> {
  const { province, municipality = null, ward = null } = input;

  if (ward && municipality) {
    const result = await query<ElectionRow>(
      `
        select
          election_year,
          election_type,
          party_name,
          candidate_name,
          votes,
          vote_share,
          turnout,
          winner_flag
        from ward_election_results
        where province_name = $1
          and municipality_name = $2
          and ward_name = $3
        order by election_year desc, vote_share desc nulls last, votes desc nulls last
      `,
      [province, municipality, ward],
    );

    return {
      geographyLevel: "ward",
      province,
      municipality,
      ward,
      rows: result.rows.map((row) => ({
        electionYear: row.election_year,
        electionType: row.election_type,
        partyName: row.party_name,
        candidateName: row.candidate_name,
        votes: row.votes,
        voteShare: row.vote_share,
        turnout: row.turnout,
        winnerFlag: row.winner_flag,
      })),
      trace: {
        table: "ward_election_results",
        query: `province=${province};municipality=${municipality};ward=${ward}`,
      },
    };
  }

  if (municipality) {
    const result = await query<ElectionRow>(
      `
        select
          election_year,
          election_type,
          party_name,
          null::text as candidate_name,
          votes,
          vote_share,
          turnout,
          winner_flag
        from municipality_election_results
        where province_name = $1
          and municipality_name = $2
        order by election_year desc, vote_share desc nulls last, votes desc nulls last
      `,
      [province, municipality],
    );

    return {
      geographyLevel: "municipality",
      province,
      municipality,
      ward: null,
      rows: result.rows.map((row) => ({
        electionYear: row.election_year,
        electionType: row.election_type,
        partyName: row.party_name,
        candidateName: null,
        votes: row.votes,
        voteShare: row.vote_share,
        turnout: row.turnout,
        winnerFlag: row.winner_flag,
      })),
      trace: {
        table: "municipality_election_results",
        query: `province=${province};municipality=${municipality}`,
      },
    };
  }

  const result = await query<ElectionRow>(
    `
      select
        election_year,
        election_type,
        party_name,
        null::text as candidate_name,
        votes,
        vote_share,
        turnout,
        winner_flag
      from province_election_results
      where province_name = $1
      order by election_year desc, vote_share desc nulls last, votes desc nulls last
    `,
    [province],
  );

  return {
    geographyLevel: "province",
    province,
    municipality: null,
    ward: null,
    rows: result.rows.map((row) => ({
      electionYear: row.election_year,
      electionType: row.election_type,
      partyName: row.party_name,
      candidateName: null,
      votes: row.votes,
      voteShare: row.vote_share,
      turnout: row.turnout,
      winnerFlag: row.winner_flag,
    })),
    trace: {
      table: "province_election_results",
      query: `province=${province}`,
    },
  };
}
