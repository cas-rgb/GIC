import { query } from "@/lib/db";

export interface RegistryConnectorSource {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceType: string;
  reliabilityTier: string;
  connectorType: string | null;
  connectorUrl: string | null;
  ingestionEnabled: boolean;
}

export async function getConnectorReadyRegistrySources(): Promise<
  RegistryConnectorSource[]
> {
  const result = await query<RegistryConnectorSource>(`
    select
      id,
      source_name as "sourceName",
      source_url as "sourceUrl",
      source_type as "sourceType",
      reliability_tier as "reliabilityTier",
      connector_type as "connectorType",
      connector_url as "connectorUrl",
      ingestion_enabled as "ingestionEnabled"
    from source_registry
    where ingestion_enabled = true
      and connector_type is not null
      and connector_url is not null
    order by source_type asc, source_name asc
  `);

  return result.rows;
}
