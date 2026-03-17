import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { loadEnv } = require("./load-env-cli");

loadEnv();

const RELEVANCE_PATTERNS = [
  /municipal/i,
  /municipality/i,
  /service delivery/i,
  /infrastructure/i,
  /water/i,
  /sewer/i,
  /sanitation/i,
  /wastewater/i,
  /electricity/i,
  /power outage/i,
  /load shedding/i,
  /road/i,
  /pothole/i,
  /bridge/i,
  /transport/i,
  /housing/i,
  /settlement/i,
  /refuse/i,
  /waste collection/i,
  /stormwater/i,
  /flood/i,
  /clinic/i,
  /hospital/i,
  /utility/i,
];

function isInfrastructureRelevant(title: string, contentText: string, url: string): boolean {
  const corpus = `${title}\n${contentText}\n${url}`;
  return RELEVANCE_PATTERNS.some((pattern) => pattern.test(corpus));
}

const PROVINCES = [
  "Gauteng",
  "Western Cape",
  "Eastern Cape",
  "KwaZulu-Natal",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

const MUNICIPALITY_ALIASES = [
  { municipality: "City of Johannesburg", province: "Gauteng", aliases: ["City of Johannesburg", "Johannesburg", "Joburg"] },
  { municipality: "City of Tshwane", province: "Gauteng", aliases: ["City of Tshwane", "Tshwane", "Pretoria"] },
  { municipality: "Ekurhuleni", province: "Gauteng", aliases: ["Ekurhuleni", "East Rand"] },
  { municipality: "Emfuleni", province: "Gauteng", aliases: ["Emfuleni", "Vanderbijlpark", "Vereeniging"] },
  { municipality: "Mogale City", province: "Gauteng", aliases: ["Mogale City", "Krugersdorp"] },
  { municipality: "City of Cape Town", province: "Western Cape", aliases: ["City of Cape Town", "Cape Town"] },
  { municipality: "George", province: "Western Cape", aliases: ["George"] },
  { municipality: "Stellenbosch", province: "Western Cape", aliases: ["Stellenbosch"] },
  { municipality: "Nelson Mandela Bay", province: "Eastern Cape", aliases: ["Nelson Mandela Bay", "Gqeberha", "Port Elizabeth"] },
  { municipality: "Buffalo City", province: "Eastern Cape", aliases: ["Buffalo City", "East London"] },
  { municipality: "King Sabata Dalindyebo", province: "Eastern Cape", aliases: ["King Sabata Dalindyebo", "Mthatha", "Umtata"] },
  { municipality: "eThekwini", province: "KwaZulu-Natal", aliases: ["eThekwini", "Durban"] },
  { municipality: "Msunduzi", province: "KwaZulu-Natal", aliases: ["Msunduzi", "Pietermaritzburg"] },
  { municipality: "uMhlathuze", province: "KwaZulu-Natal", aliases: ["uMhlathuze", "Richards Bay"] },
  { municipality: "Mangaung", province: "Free State", aliases: ["Mangaung", "Bloemfontein"] },
  { municipality: "Polokwane", province: "Limpopo", aliases: ["Polokwane"] },
  { municipality: "Makhado", province: "Limpopo", aliases: ["Makhado", "Louis Trichardt"] },
  { municipality: "Lephalale", province: "Limpopo", aliases: ["Lephalale"] },
  { municipality: "Mbombela", province: "Mpumalanga", aliases: ["Mbombela", "Nelspruit"] },
  { municipality: "Emalahleni", province: "Mpumalanga", aliases: ["Emalahleni", "Witbank"] },
  { municipality: "Thembisile Hani", province: "Mpumalanga", aliases: ["Thembisile Hani"] },
  { municipality: "Rustenburg", province: "North West", aliases: ["Rustenburg"] },
  { municipality: "Mahikeng", province: "North West", aliases: ["Mahikeng", "Mafikeng"] },
  { municipality: "Sol Plaatje", province: "Northern Cape", aliases: ["Sol Plaatje", "Kimberley"] },
];

const PROVINCE_ALIASES = PROVINCES.flatMap((province) => {
  const aliases = [province];
  if (province === "KwaZulu-Natal") aliases.push("KZN");
  return aliases.map((alias) => ({ alias, province }));
});

const CITIZEN_PRESSURE_PATTERNS = [
  /protest/i,
  /anger/i,
  /frustration/i,
  /residents/i,
  /complaint/i,
  /shutdown/i,
  /crisis/i,
  /debt crisis/i,
  /shortfall/i,
  /high alert/i,
  /flooding/i,
  /under scrutiny/i,
  /worst-performing/i,
  /service failures?/i,
  /mismanagement/i,
  /go missing/i,
  /decay/i,
  /urgent/i,
  /warn(?:ed|ing)/i,
  /collapse/i,
];

const SIGNAL_RULES = [
  {
    sector: "Civil",
    signalType: "water_outage",
    sentiment: "negative",
    severityScore: 82,
    urgencyScore: 88,
    patterns: [/water outage/i, /no water/i, /water cuts/i, /burst pipe/i, /water interruption/i],
  },
  {
    sector: "Civil",
    signalType: "sewer_overflow",
    sentiment: "negative",
    severityScore: 80,
    urgencyScore: 82,
    patterns: [/sewer/i, /sanitation/i, /overflow/i, /wastewater/i],
  },
  {
    sector: "Roads",
    signalType: "road_damage",
    sentiment: "negative",
    severityScore: 70,
    urgencyScore: 68,
    patterns: [/pothole/i, /road damage/i, /road collapse/i, /bridge damage/i, /transport disruption/i],
  },
  {
    sector: "Health",
    signalType: "facility_pressure",
    sentiment: "negative",
    severityScore: 76,
    urgencyScore: 72,
    patterns: [/clinic/i, /hospital/i, /medical/i, /backlog/i],
  },
  {
    sector: "Structural",
    signalType: "structural_risk",
    sentiment: "negative",
    severityScore: 84,
    urgencyScore: 79,
    patterns: [/structural/i, /unsafe building/i, /collapse/i, /facility/i],
  },
  {
    sector: "Apex",
    signalType: "power_interruptions",
    sentiment: "negative",
    severityScore: 78,
    urgencyScore: 76,
    patterns: [/power/i, /electricity/i, /load reduction/i, /outage/i],
  },
  {
    sector: "Civil",
    signalType: "flood_damage",
    sentiment: "negative",
    severityScore: 85,
    urgencyScore: 86,
    patterns: [/flood/i, /flooding/i, /stormwater/i, /heavy rain/i],
  },
  {
    sector: "Apex",
    signalType: "municipal_failure",
    sentiment: "negative",
    severityScore: 74,
    urgencyScore: 70,
    patterns: [/municipal service failures?/i, /worst-performing municipalities?/i, /municipal infrastructure decay/i, /mismanagement/i, /under scrutiny/i],
  },
];

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function detectSectorHints(text: string): string[] {
  const hints = new Set<string>();
  if (/water|sewer|sanitation|wastewater/i.test(text)) hints.add("Civil");
  if (/road|pothole|bridge|transport/i.test(text)) hints.add("Roads");
  if (/clinic|hospital|health|medical/i.test(text)) hints.add("Health");
  if (/building|collapse|structural|facility/i.test(text)) hints.add("Structural");
  if (/power|electricity|executive|intervention/i.test(text)) hints.add("Apex");
  return hints.size > 0 ? Array.from(hints) : ["Civil"];
}

function findProvinceMatch(text: string): string | null {
  const lowered = text.toLowerCase();
  let bestIndex = Number.POSITIVE_INFINITY;
  let bestProvince: string | null = null;

  for (const entry of PROVINCE_ALIASES) {
    const index = lowered.indexOf(entry.alias.toLowerCase());
    if (index !== -1 && index < bestIndex) {
      bestIndex = index;
      bestProvince = entry.province;
    }
  }

  return bestProvince;
}

function findNamedProvince(text: string | null | undefined): string | null {
  if (!text) {
    return null;
  }

  return PROVINCES.find((province) => text.includes(province)) ?? null;
}

function findMunicipalityMatch(text: string): { municipality: string; province: string } | null {
  const lowered = text.toLowerCase();
  let bestIndex = Number.POSITIVE_INFINITY;
  let bestMatch: { municipality: string; province: string } | null = null;

  for (const entry of MUNICIPALITY_ALIASES) {
    for (const alias of entry.aliases) {
      const index = lowered.indexOf(alias.toLowerCase());
      if (index !== -1 && index < bestIndex) {
        bestIndex = index;
        bestMatch = {
          municipality: entry.municipality,
          province: entry.province,
        };
      }
    }
  }

  return bestMatch;
}

function inferServiceDomain(signalType: string, summaryText: string): string {
  const corpus = `${signalType} ${summaryText}`.toLowerCase();
  if (corpus.includes("water") || corpus.includes("sewer")) return "Water Infrastructure";
  if (corpus.includes("road") || corpus.includes("bridge") || corpus.includes("transport")) return "Roads and Transport";
  if (corpus.includes("clinic") || corpus.includes("hospital") || corpus.includes("medical")) return "Healthcare";
  if (corpus.includes("power") || corpus.includes("electricity")) return "Electricity Supply";
  if (corpus.includes("structural") || corpus.includes("building")) return "Provincial Infrastructure";
  return "Other";
}

function scoreToSeverity(score: number): "Low" | "Medium" | "High" {
  if (score >= 75) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

async function main(): Promise<void> {
  const { pool, query } = require("../src/lib/db");

  const jobsResult = await query(`
    select id, payload
    from job_queue
    where status = 'queued'
      and job_type = 'process_document'
    order by created_at asc
  `);

  let processed = 0;

  for (const job of jobsResult.rows) {
    const client = await pool.connect();
    const txQuery = (text: string, params: unknown[] = []) => client.query(text, params);

    try {
      const payload = job.payload as {
        documentId: string;
        sourceId: string;
        parserVersion: string;
      };

      await txQuery("begin");

      const documentResult = await txQuery(
        `
          select
            id,
            source_id,
            location_id,
            url,
            title,
            content_text,
            published_at,
            created_at,
            (select name from sources where id = documents.source_id) as source_name,
            (select base_url from sources where id = documents.source_id) as source_base_url,
            (select source_type from sources where id = documents.source_id) as source_type,
            parser_version
          from documents
          where id = $1
        `,
        [payload.documentId]
      );

      const document = documentResult.rows[0];
      if (!document) {
        await txQuery(
          `update job_queue set status = 'failed', last_error = 'document not found', updated_at = now() where id = $1`,
          [job.id]
        );
        await txQuery("commit");
        continue;
      }

      if (!isInfrastructureRelevant(document.title, document.content_text, document.url)) {
        await txQuery(`update documents set status = 'archived' where id = $1`, [document.id]);
        await txQuery(
          `update job_queue set status = 'completed', updated_at = now() where id = $1`,
          [job.id]
        );
        await txQuery("commit");
        continue;
      }

      let locationId = document.location_id as string | null;

      if (!locationId) {
        const corpus = `${document.title}\n${document.content_text}\n${document.source_name ?? ""}\n${document.source_base_url ?? ""}`;
        const municipalityMatch = findMunicipalityMatch(corpus);
        const sourceNamedProvince = findNamedProvince(document.source_name);
        const titleNamedProvince = findNamedProvince(document.title);
        const isTreasuryDocument =
          document.parser_version === "municipal-money-v1" ||
          document.source_type === "treasury";
        const province = isTreasuryDocument
          ? sourceNamedProvince ?? titleNamedProvince ?? findProvinceMatch(corpus)
          : municipalityMatch?.province ??
            sourceNamedProvince ??
            titleNamedProvince ??
            findProvinceMatch(corpus);
        const municipality = isTreasuryDocument ? null : municipalityMatch?.municipality ?? null;

        if (province || municipality) {
          const locationKey = ["South Africa", province ?? "", "", municipality ?? "", ""].join("|");
          const locationResult = await txQuery(
            `
              insert into locations (country, province, district, municipality, ward, location_key)
              values ('South Africa', $1, null, $2, null, $3)
              on conflict (location_key)
              do update set
                province = excluded.province,
                municipality = excluded.municipality
              returning id
            `,
            [province, municipality, locationKey]
          );

          locationId = locationResult.rows[0]?.id ?? null;

          if (locationId) {
            await txQuery(`update documents set location_id = $2 where id = $1`, [
              document.id,
              locationId,
            ]);
          }
        }
      }

      const sectorHints = detectSectorHints(`${document.title}\n${document.content_text}`);
      const sentences = splitSentences(`${document.title}. ${document.content_text}`).slice(0, 50);
      const signals: Array<{
        id: string;
        signalType: string;
        summaryText: string;
        severityScore: number;
        confidenceScore: number;
      }> = [];

      for (const sentence of sentences) {
        for (const rule of SIGNAL_RULES) {
          if (!rule.patterns.some((pattern) => pattern.test(sentence))) {
            continue;
          }

          if (sectorHints.length > 0 && !sectorHints.includes(rule.sector)) {
            continue;
          }

          const signalResult = await txQuery(
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
              document.id,
              locationId,
              rule.sector,
              rule.signalType,
              rule.sentiment,
              rule.severityScore,
              rule.urgencyScore,
              0.72,
              document.published_at,
              sentence.slice(0, 400),
              document.url,
            ]
          );

          signals.push({
            id: signalResult.rows[0].id,
            signalType: rule.signalType,
            summaryText: sentence.slice(0, 400),
            severityScore: rule.severityScore,
            confidenceScore: 0.72,
          });

          if (signals.length >= 5) {
            break;
          }
        }

        if (signals.length >= 5) {
          break;
        }
      }

      if (signals.length === 0) {
        const signalResult = await txQuery(
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
            values ($1, $2, $3, 'general_signal', 'neutral', 30, 25, 0.45, $4, $5, $6, 'active')
            returning id
          `,
          [
            document.id,
            locationId,
            sectorHints[0] ?? "Civil",
            document.published_at,
            document.title.slice(0, 400),
            document.url,
          ]
        );

        signals.push({
          id: signalResult.rows[0].id,
          signalType: "general_signal",
          summaryText: document.title.slice(0, 400),
          severityScore: 30,
          confidenceScore: 0.45,
        });
      }

      for (const signal of signals) {
        if (signal.severityScore < 45) {
          continue;
        }

        const lowerSummary = signal.summaryText.toLowerCase();
        const failureIndicator = signal.severityScore >= 55;
        const citizenPressureIndicator =
          CITIZEN_PRESSURE_PATTERNS.some((pattern) => pattern.test(lowerSummary)) ||
          (signal.severityScore >= 70 &&
            /crisis|flood|debt|failure|collapse|shortfall|mismanagement/i.test(lowerSummary));

        if (!failureIndicator && !citizenPressureIndicator) {
          continue;
        }

        await txQuery(
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
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, null)
          `,
          [
            signal.id,
            locationId,
            inferServiceDomain(signal.signalType, signal.summaryText),
            signal.signalType,
            failureIndicator,
            citizenPressureIndicator,
            /protest|march|blockade|shutdown/.test(lowerSummary),
            /restored|repair|response|intervention|dispatched/.test(lowerSummary),
            /again|recurring|ongoing|repeated/.test(lowerSummary),
            scoreToSeverity(signal.severityScore),
            signal.confidenceScore,
            document.published_at,
          ]
        );
      }

      await txQuery(
        `
          insert into document_processing_runs (
            document_id,
            parser_version,
            passed,
            extraction_confidence,
            errors,
            warnings
          )
          values ($1, $2, true, 0.72, '[]'::jsonb, '[]'::jsonb)
        `,
        [document.id, payload.parserVersion ?? "processor-v1"]
      );

      await txQuery(
        `update job_queue set status = 'completed', updated_at = now() where id = $1`,
        [job.id]
      );

      await txQuery("commit");
      processed += 1;
    } catch (error) {
      await txQuery("rollback").catch(() => undefined);
      const message = error instanceof Error ? error.message : String(error);
      await query(
        `update job_queue set status = 'failed', last_error = $2, updated_at = now() where id = $1`,
        [job.id, message.slice(0, 500)]
      );
    } finally {
      client.release();
    }
  }

  await query(`
    insert into fact_service_pressure_daily (
      day,
      province,
      municipality,
      service_domain,
      pressure_case_count,
      high_severity_count,
      protest_count,
      response_count,
      avg_classification_confidence,
      source_document_count
    )
    select
      coalesce(date(si.opened_at), date(s.created_at)) as day,
      l.province,
      coalesce(l.municipality, 'Province Wide') as municipality,
      si.service_domain,
      count(*) as pressure_case_count,
      count(*) filter (where si.severity = 'High') as high_severity_count,
      count(*) filter (where si.protest_indicator = true) as protest_count,
      count(*) filter (where si.response_indicator = true) as response_count,
      round(avg(si.classification_confidence)::numeric, 3) as avg_classification_confidence,
      count(distinct s.document_id) as source_document_count
    from service_incidents si
    join signals s on s.id = si.signal_id
    left join locations l on l.id = coalesce(si.location_id, s.location_id)
    where si.citizen_pressure_indicator = true
      and si.failure_indicator = true
      and l.province is not null
    group by 1, 2, 3, 4
    on conflict (day, province, municipality, service_domain)
    do update set
      pressure_case_count = excluded.pressure_case_count,
      high_severity_count = excluded.high_severity_count,
      protest_count = excluded.protest_count,
      response_count = excluded.response_count,
      avg_classification_confidence = excluded.avg_classification_confidence,
      source_document_count = excluded.source_document_count
  `);

  await query(`
    insert into fact_source_reliability_daily (
      day,
      province,
      source_type,
      source_count,
      avg_reliability_score,
      document_count
    )
    select
      coalesce(date(d.published_at), date(d.created_at)) as day,
      l.province,
      src.source_type,
      count(distinct src.id) as source_count,
      round(avg(src.reliability_score)::numeric, 3) as avg_reliability_score,
      count(distinct d.id) as document_count
    from documents d
    join sources src on src.id = d.source_id
    left join locations l on l.id = d.location_id
    where d.status = 'active'
      and l.province is not null
    group by 1, 2, 3
    on conflict (day, province, source_type)
    do update set
      source_count = excluded.source_count,
      avg_reliability_score = excluded.avg_reliability_score,
      document_count = excluded.document_count
  `);

  console.log(JSON.stringify({ processed }, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
