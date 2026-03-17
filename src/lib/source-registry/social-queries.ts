import { query } from "@/lib/db";

export interface SocialCoverageRow {
  province: string | null;
  accountCount: number;
}

export interface SocialPlatformRow {
  platform: string;
  accountCount: number;
}

export interface SocialCoverageResponse {
  totals: {
    accountCount: number;
    verifiedCount: number;
  };
  byProvince: SocialCoverageRow[];
  byPlatform: SocialPlatformRow[];
  trace: {
    table: string;
  };
}

interface SocialTotalsRow {
  accountCount: number;
  verifiedCount: number;
}

export async function getSocialCoverageSummary(): Promise<SocialCoverageResponse> {
  const [totalsResult, byProvinceResult, byPlatformResult] = await Promise.all([
    query<SocialTotalsRow>(`
      select
        count(*)::int as "accountCount",
        count(*) filter (where verification_status = 'verified')::int as "verifiedCount"
      from social_account_whitelist
    `),
    query<SocialCoverageRow>(`
      select
        province,
        count(*)::int as "accountCount"
      from social_account_whitelist
      group by province
      order by
        case when province is null then 1 else 0 end,
        province asc
    `),
    query<SocialPlatformRow>(`
      select
        platform,
        count(*)::int as "accountCount"
      from social_account_whitelist
      group by platform
      order by count(*) desc, platform asc
    `),
  ]);

  return {
    totals: totalsResult.rows[0] ?? {
      accountCount: 0,
      verifiedCount: 0,
    },
    byProvince: byProvinceResult.rows,
    byPlatform: byPlatformResult.rows,
    trace: {
      table: "social_account_whitelist",
    },
  };
}
