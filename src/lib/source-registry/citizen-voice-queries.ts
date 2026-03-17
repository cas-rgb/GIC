import { query } from "@/lib/db";
import {
  CitizenVoiceIssueRow,
  CitizenVoiceQueryPackRow,
  CitizenVoiceReadinessResponse,
} from "@/lib/source-registry/types";

interface CitizenVoiceTotalsRow {
  packCount: number;
  verifiedCount: number;
  provinceCoverageCount: number;
}

export async function getCitizenVoiceReadiness(): Promise<CitizenVoiceReadinessResponse> {
  const [totalsResult, byScopeResult, byIssueResult] = await Promise.all([
    query<CitizenVoiceTotalsRow>(`
      select
        count(*)::int as "packCount",
        count(*) filter (where verification_status = 'verified')::int as "verifiedCount",
        count(distinct scope_name)::int as "provinceCoverageCount"
      from citizen_voice_query_packs
    `),
    query<CitizenVoiceQueryPackRow>(`
      select
        scope_type as "scopeType",
        scope_name as "scopeName",
        platform,
        issue_family as "issueFamily",
        count(*)::int as "packCount"
      from citizen_voice_query_packs
      group by scope_type, scope_name, platform, issue_family
      order by scope_name asc, issue_family asc, platform asc
    `),
    query<CitizenVoiceIssueRow>(`
      select
        issue_family as "issueFamily",
        count(*)::int as "packCount"
      from citizen_voice_query_packs
      group by issue_family
      order by count(*) desc, issue_family asc
    `),
  ]);

  return {
    totals: totalsResult.rows[0] ?? {
      packCount: 0,
      verifiedCount: 0,
      provinceCoverageCount: 0,
    },
    byScope: byScopeResult.rows,
    byIssue: byIssueResult.rows,
    trace: {
      table: "citizen_voice_query_packs",
    },
  };
}
