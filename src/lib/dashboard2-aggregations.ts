// src/lib/dashboard2-aggregations.ts
import {
  ServicePressureCase,
  ProvinceMunicipalityExposureRow,
  ProvinceServicePressureBreakdownRow,
  ProvinceServicePressureTrendRow,
  ProvinceStressEscalationMatrixRow
} from '@/types/dashboard2';
import { toConfidence } from './governance/confidence';

function filteredCases(province: string, rows: ServicePressureCase[]) {
  return rows.filter(
    r =>
      r.province === province &&
      r.citizenPressureIndicator === true &&
      r.serviceFailureIndicator === true
  );
}

export function buildProvinceServicePressureBreakdown(
  province: string,
  rows: ServicePressureCase[]
): ProvinceServicePressureBreakdownRow[] {
  const filtered = filteredCases(province, rows);
  const total = filtered.length;

  const grouped = new Map<
    string,
    { count: number; highSeverityCount: number }
  >();

  for (const row of filtered) {
    const current = grouped.get(row.serviceDomain) || { count: 0, highSeverityCount: 0 };
    current.count += 1;
    if (row.severity === 'High') current.highSeverityCount += 1;
    grouped.set(row.serviceDomain, current);
  }

  return Array.from(grouped.entries())
    .map(([serviceDomain, data]) => ({
      province,
      serviceDomain: serviceDomain as ProvinceServicePressureBreakdownRow['serviceDomain'],
      pressureCaseCount: data.count,
      shareOfPressurePercentage: Number(((data.count / Math.max(total, 1)) * 100).toFixed(1)),
      highSeverityCount: data.highSeverityCount,
      confidence: toConfidence(data.count),
      sourceCount: data.count,
      trace: [{
        table: 'service_pressure_case',
        query: `groupby service_domain for province ${province}`,
        sourceCount: data.count,
        timestamp: new Date().toISOString()
      }]
    }))
    .sort((a, b) => b.pressureCaseCount - a.pressureCaseCount);
}

export function buildProvinceServicePressureTrend(
  province: string,
  rows: ServicePressureCase[]
): ProvinceServicePressureTrendRow[] {
  const filtered = filteredCases(province, rows).filter(r => r.publishedDate);

  const grouped = new Map<
    string,
    { count: number; highSeverityCount: number }
  >();

  for (const row of filtered) {
    const date = row.publishedDate!.slice(0, 10);
    const key = `${date}__${row.serviceDomain}`;
    const current = grouped.get(key) || { count: 0, highSeverityCount: 0 };
    current.count += 1;
    if (row.severity === 'High') current.highSeverityCount += 1;
    grouped.set(key, current);
  }

  const records = Array.from(grouped.entries()).map(([key, data]) => {
    const [reportingDate, serviceDomain] = key.split('__');

    return {
      province,
      reportingDate,
      serviceDomain: serviceDomain as ProvinceServicePressureTrendRow['serviceDomain'],
      pressureCaseCount: data.count,
      rolling7DayAverage: null,
      trendDirection: 'UNKNOWN' as const,
      highSeverityShare: Number(((data.highSeverityCount / data.count) * 100).toFixed(1)),
      confidence: toConfidence(data.count),
      sourceCount: data.count,
      trace: [{
        table: 'service_pressure_case',
        query: `trend logic for ${province}`,
        sourceCount: data.count,
        timestamp: new Date().toISOString()
      }]
    };
  });

  return records.sort((a, b) => a.reportingDate.localeCompare(b.reportingDate));
}

export function buildProvinceMunicipalityExposure(
  province: string,
  rows: ServicePressureCase[]
): ProvinceMunicipalityExposureRow[] {
  const filtered = filteredCases(province, rows).filter(r => r.municipality);

  const grouped = new Map<
    string,
    {
      pressureCaseCount: number;
      highSeverityCount: number;
      protestCaseCount: number;
      responseCaseCount: number;
      domainCounts: Map<string, number>;
    }
  >();

  for (const row of filtered) {
    const current = grouped.get(row.municipality!) || {
      pressureCaseCount: 0,
      highSeverityCount: 0,
      protestCaseCount: 0,
      responseCaseCount: 0,
      domainCounts: new Map<string, number>()
    };

    current.pressureCaseCount += 1;
    if (row.severity === 'High') current.highSeverityCount += 1;
    if (row.protestIndicator) current.protestCaseCount += 1;
    if (row.responseIndicator) current.responseCaseCount += 1;
    current.domainCounts.set(
      row.serviceDomain,
      (current.domainCounts.get(row.serviceDomain) || 0) + 1
    );

    grouped.set(row.municipality!, current);
  }

  return Array.from(grouped.entries())
    .map(([municipality, data]) => {
      const entries = Array.from(data.domainCounts.entries()).sort((a, b) => b[1] - a[1]);
      const dominantServiceDomain = entries[0]?.[0] || null;

      return {
        province,
        municipality,
        pressureCaseCount: data.pressureCaseCount,
        highSeverityCount: data.highSeverityCount,
        protestCaseCount: data.protestCaseCount,
        responseCaseCount: data.responseCaseCount,
        dominantServiceDomain:
          dominantServiceDomain as ProvinceMunicipalityExposureRow['dominantServiceDomain'],
        confidence: toConfidence(data.pressureCaseCount),
        sourceCount: data.pressureCaseCount,
        trace: [{
          table: 'service_pressure_case',
          query: `exposure ranking for ${province}`,
          sourceCount: data.pressureCaseCount,
          timestamp: new Date().toISOString()
        }]
      };
    })
    .sort((a, b) => b.pressureCaseCount - a.pressureCaseCount);
}

export function buildProvinceStressEscalationMatrix(
  province: string,
  municipalityRows: ProvinceMunicipalityExposureRow[]
): ProvinceStressEscalationMatrixRow[] {
  return municipalityRows.map(row => {
    const currentPressureScore = row.pressureCaseCount;
    const recentEscalationScore = Number(
      (
        row.highSeverityCount * 1.2 +
        row.protestCaseCount * 1.5 -
        row.responseCaseCount * 0.4
      ).toFixed(1)
    );
    const severityWeight = row.highSeverityCount + row.protestCaseCount;

    let stressStatus: ProvinceStressEscalationMatrixRow['stressStatus'] = 'Monitored';
    if (currentPressureScore >= 10 && recentEscalationScore >= 6) stressStatus = 'Acute Flashpoint';
    else if (recentEscalationScore >= 4) stressStatus = 'Escalating Risk';
    else if (currentPressureScore >= 8) stressStatus = 'Chronic Pressure';

    return {
      province,
      municipality: row.municipality,
      currentPressureScore,
      recentEscalationScore,
      severityWeight,
      stressStatus,
      confidence: row.confidence,
      methodUsed: row.confidence === 'LOW' ? 'partial' : 'numeric',
      sourceCount: row.sourceCount,
      trace: [{
        table: 'province_municipality_exposure',
        query: `matrix derivation for ${row.municipality}`,
        sourceCount: row.sourceCount,
        timestamp: new Date().toISOString()
      }]
    };
  });
}
