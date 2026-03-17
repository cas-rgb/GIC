alter table source_registry
  add column if not exists connector_type text,
  add column if not exists connector_url text,
  add column if not exists ingestion_enabled boolean not null default false;

alter table sources
  add column if not exists external_registry_id text unique;

create index if not exists source_registry_ingestion_enabled_idx
  on source_registry(ingestion_enabled);

create index if not exists source_registry_connector_type_idx
  on source_registry(connector_type);
