import { PoolClient } from "pg";

import { pool, query } from "@/lib/db";
import { ProcessingRepository } from "@/lib/processing/repository";
import {
  DocumentRecord,
  NormalizedBudget,
  NormalizedIncident,
  NormalizedLocation,
  NormalizedSignal,
  NormalizedTender,
  ProcessingQualityReport,
} from "@/lib/processing/types";

interface DocumentRow {
  id: string;
  source_id: string;
  location_id: string | null;
  url: string;
  title: string;
  content_text: string;
  published_at: string | null;
  doc_type: DocumentRecord["docType"];
  status: DocumentRecord["status"];
}

function mapDocumentRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    sourceId: row.source_id,
    locationId: row.location_id,
    url: row.url,
    title: row.title,
    contentText: row.content_text,
    publishedAt: row.published_at,
    docType: row.doc_type,
    status: row.status,
  };
}

function buildLocationKey(location: NormalizedLocation): string {
  return [
    location.country,
    location.province ?? "",
    location.district ?? "",
    location.municipality ?? "",
    location.ward ?? "",
  ].join("|");
}

async function withTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("begin");
    const result = await operation(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export class PostgresProcessingRepository implements ProcessingRepository {
  async getDocument(documentId: string): Promise<DocumentRecord> {
    const result = await query<DocumentRow>(
      `
        select
          id,
          source_id,
          location_id,
          url,
          title,
          content_text,
          published_at,
          doc_type,
          status
        from documents
        where id = $1
      `,
      [documentId],
    );

    if (result.rows.length === 0) {
      throw new Error(`document not found: ${documentId}`);
    }

    return mapDocumentRow(result.rows[0]);
  }

  async upsertLocation(location: NormalizedLocation): Promise<string> {
    const result = await query<{ id: string }>(
      `
        insert into locations (
          country,
          province,
          district,
          municipality,
          ward,
          location_key
        )
        values ($1, $2, $3, $4, $5, $6)
        on conflict (location_key)
        do update set
          country = excluded.country,
          province = excluded.province,
          district = excluded.district,
          municipality = excluded.municipality,
          ward = excluded.ward
        returning id
      `,
      [
        location.country,
        location.province,
        location.district,
        location.municipality,
        location.ward,
        buildLocationKey(location),
      ],
    );

    return result.rows[0].id;
  }

  async saveSignals(
    documentId: string,
    locationId: string | null,
    signals: NormalizedSignal[],
  ): Promise<string[]> {
    if (signals.length === 0) {
      return [];
    }

    return withTransaction(async (client) => {
      const signalIds: string[] = [];

      for (const signal of signals) {
        const result = await client.query<{ id: string }>(
          `
            insert into signals (
              document_id,
              location_id,
              sector,
              signal_type,
              sentiment,
              severity_score,
              urgency_score,
              confidence_score,
              event_date,
              summary_text,
              source_url,
              status
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'active')
            returning id
          `,
          [
            documentId,
            locationId,
            signal.sector,
            signal.signalType,
            signal.sentiment,
            signal.severityScore,
            signal.urgencyScore,
            signal.confidenceScore,
            signal.eventDate,
            signal.summaryText,
            signal.sourceUrl,
          ],
        );

        signalIds.push(result.rows[0].id);
      }

      return signalIds;
    });
  }

  async saveIncidents(
    signalIds: string[],
    locationId: string | null,
    incidents: NormalizedIncident[],
  ): Promise<void> {
    if (signalIds.length === 0 || incidents.length === 0) {
      return;
    }

    await withTransaction(async (client) => {
      for (let index = 0; index < incidents.length; index += 1) {
        const incident = incidents[index];
        const signalId = signalIds[Math.min(index, signalIds.length - 1)];

        await client.query(
          `
            insert into service_incidents (
              signal_id,
              location_id,
              service_domain,
              incident_type,
              failure_indicator,
              citizen_pressure_indicator,
              protest_indicator,
              response_indicator,
              recurrence_indicator,
              severity,
              classification_confidence,
              opened_at,
              closed_at
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          `,
          [
            signalId,
            locationId,
            incident.serviceDomain,
            incident.incidentType,
            incident.failureIndicator,
            incident.citizenPressureIndicator,
            incident.protestIndicator,
            incident.responseIndicator,
            incident.recurrenceIndicator,
            incident.severity,
            incident.classificationConfidence,
            incident.openedAt,
            incident.closedAt,
          ],
        );
      }
    });
  }

  async saveTenders(
    documentId: string,
    locationId: string | null,
    tenders: NormalizedTender[],
  ): Promise<void> {
    if (tenders.length === 0) {
      return;
    }

    await withTransaction(async (client) => {
      for (const tender of tenders) {
        await client.query(
          `
            insert into tenders (
              document_id,
              location_id,
              sector,
              title,
              issuer,
              closing_date,
              estimated_value,
              status
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            documentId,
            locationId,
            tender.sector,
            tender.title,
            tender.issuer,
            tender.closingDate,
            tender.estimatedValue,
            tender.status,
          ],
        );
      }
    });
  }

  async saveBudgets(
    documentId: string,
    locationId: string | null,
    budgets: NormalizedBudget[],
  ): Promise<void> {
    if (budgets.length === 0) {
      return;
    }

    await withTransaction(async (client) => {
      for (const budget of budgets) {
        await client.query(
          `
            insert into budgets (
              document_id,
              location_id,
              sector,
              program_name,
              budget_amount,
              period_start,
              period_end
            )
            values ($1, $2, $3, $4, $5, $6, $7)
          `,
          [
            documentId,
            locationId,
            budget.sector,
            budget.programName,
            budget.budgetAmount,
            budget.periodStart,
            budget.periodEnd,
          ],
        );
      }
    });
  }

  async markProcessed(
    documentId: string,
    parserVersion: string,
    quality: ProcessingQualityReport,
  ): Promise<void> {
    await query(
      `
        insert into document_processing_runs (
          document_id,
          parser_version,
          passed,
          extraction_confidence,
          errors,
          warnings
        )
        values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
      `,
      [
        documentId,
        parserVersion,
        quality.passed,
        quality.extractionConfidence,
        JSON.stringify(quality.errors),
        JSON.stringify(quality.warnings),
      ],
    );
  }
}
