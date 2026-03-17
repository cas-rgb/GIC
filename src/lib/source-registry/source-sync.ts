import { query } from "@/lib/db";
import { getConnectorReadyRegistrySources } from "@/lib/source-registry/connector-queries";

function mapRegistryTypeToOperationalType(
  sourceType: string
): "news" | "gov" | "internal" | "social" | "ngo" {
  switch (sourceType) {
    case "official_gov":
    case "treasury":
    case "utility":
    case "stats":
      return "gov";
    case "news":
      return "news";
    case "ngo":
    case "research":
    case "watchdog":
      return "ngo";
    default:
      return "internal";
  }
}

function mapReliabilityTierToScore(reliabilityTier: string): number {
  switch (reliabilityTier) {
    case "tier_1":
      return 0.95;
    case "tier_2":
      return 0.85;
    case "tier_3":
      return 0.7;
    default:
      return 0.5;
  }
}

export async function syncConnectorReadySources(): Promise<{
  synced: number;
}> {
  const registrySources = await getConnectorReadyRegistrySources();

  for (const source of registrySources) {
    await query(
      `
        insert into sources (
          name,
          source_type,
          base_url,
          reliability_score,
          active,
          external_registry_id,
          created_at,
          updated_at
        )
        values ($1, $2, $3, $4, true, $5, now(), now())
        on conflict (external_registry_id)
        do update set
          name = excluded.name,
          source_type = excluded.source_type,
          base_url = excluded.base_url,
          reliability_score = excluded.reliability_score,
          active = true,
          updated_at = now()
      `,
      [
        source.sourceName,
        mapRegistryTypeToOperationalType(source.sourceType),
        source.connectorUrl ?? source.sourceUrl,
        mapReliabilityTierToScore(source.reliabilityTier),
        source.id,
      ]
    );
  }

  return {
    synced: registrySources.length,
  };
}
