import { query } from "@/lib/db";
import { PlaceProfileResponse } from "@/lib/analytics/types";

interface PlaceProfileRow {
  year: number;
  population_total: number | null;
  households_total: number | null;
  unemployment_rate: number | null;
  service_access_water: number | null;
  service_access_electricity: number | null;
  service_access_sanitation: number | null;
  language_profile: Record<string, unknown>;
  settlement_profile: Record<string, unknown>;
  economic_profile: Record<string, unknown>;
  income_band_summary: Record<string, unknown>;
}

export async function getPlaceProfile(input: {
  province: string;
  municipality?: string | null;
  ward?: string | null;
}): Promise<PlaceProfileResponse> {
  const { province, municipality = null, ward = null } = input;

  if (ward && municipality) {
    const result = await query<PlaceProfileRow>(
      `
        select
          year,
          population_total,
          households_total,
          unemployment_rate,
          service_access_water,
          service_access_electricity,
          service_access_sanitation,
          language_profile,
          settlement_profile,
          economic_profile,
          income_band_summary
        from ward_demographics_yearly
        where province_name = $1
          and municipality_name = $2
          and ward_name = $3
        order by year desc
        limit 1
      `,
      [province, municipality, ward],
    );

    return {
      geographyLevel: "ward",
      province,
      municipality,
      ward,
      latestYear: result.rows[0]?.year ?? null,
      demographics: result.rows[0]
        ? {
            populationTotal: result.rows[0].population_total,
            householdsTotal: result.rows[0].households_total,
            unemploymentRate: result.rows[0].unemployment_rate,
            serviceAccessWater: result.rows[0].service_access_water,
            serviceAccessElectricity: result.rows[0].service_access_electricity,
            serviceAccessSanitation: result.rows[0].service_access_sanitation,
            languageProfile: result.rows[0].language_profile ?? {},
            settlementProfile: result.rows[0].settlement_profile ?? {},
            economicProfile: result.rows[0].economic_profile ?? {},
            incomeBandSummary: result.rows[0].income_band_summary ?? {},
          }
        : null,
      trace: {
        table: "ward_demographics_yearly",
        query: `province=${province};municipality=${municipality};ward=${ward}`,
      },
    };
  }

  if (municipality) {
    const result = await query<PlaceProfileRow>(
      `
        select
          year,
          population_total,
          households_total,
          unemployment_rate,
          service_access_water,
          service_access_electricity,
          service_access_sanitation,
          language_profile,
          settlement_profile,
          economic_profile,
          income_band_summary
        from municipality_demographics_yearly
        where province_name = $1
          and municipality_name = $2
        order by year desc
        limit 1
      `,
      [province, municipality],
    );

    return {
      geographyLevel: "municipality",
      province,
      municipality,
      ward: null,
      latestYear: result.rows[0]?.year ?? null,
      demographics: result.rows[0]
        ? {
            populationTotal: result.rows[0].population_total,
            householdsTotal: result.rows[0].households_total,
            unemploymentRate: result.rows[0].unemployment_rate,
            serviceAccessWater: result.rows[0].service_access_water,
            serviceAccessElectricity: result.rows[0].service_access_electricity,
            serviceAccessSanitation: result.rows[0].service_access_sanitation,
            languageProfile: result.rows[0].language_profile ?? {},
            settlementProfile: result.rows[0].settlement_profile ?? {},
            economicProfile: result.rows[0].economic_profile ?? {},
            incomeBandSummary: result.rows[0].income_band_summary ?? {},
          }
        : null,
      trace: {
        table: "municipality_demographics_yearly",
        query: `province=${province};municipality=${municipality}`,
      },
    };
  }

  const result = await query<PlaceProfileRow>(
    `
      select
        year,
        population_total,
        households_total,
        unemployment_rate,
        service_access_water,
        service_access_electricity,
        service_access_sanitation,
        language_profile,
        settlement_profile,
        economic_profile,
        income_band_summary
      from province_demographics_yearly
      where province_name = $1
      order by year desc
      limit 1
    `,
    [province],
  );

  return {
    geographyLevel: "province",
    province,
    municipality: null,
    ward: null,
    latestYear: result.rows[0]?.year ?? null,
    demographics: result.rows[0]
      ? {
          populationTotal: result.rows[0].population_total,
          householdsTotal: result.rows[0].households_total,
          unemploymentRate: result.rows[0].unemployment_rate,
          serviceAccessWater: result.rows[0].service_access_water,
          serviceAccessElectricity: result.rows[0].service_access_electricity,
          serviceAccessSanitation: result.rows[0].service_access_sanitation,
          languageProfile: result.rows[0].language_profile ?? {},
          settlementProfile: result.rows[0].settlement_profile ?? {},
          economicProfile: result.rows[0].economic_profile ?? {},
          incomeBandSummary: result.rows[0].income_band_summary ?? {},
        }
      : null,
    trace: {
      table: "province_demographics_yearly",
      query: `province=${province}`,
    },
  };
}
